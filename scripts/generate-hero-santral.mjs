#!/usr/bin/env node
/**
 * Generate a Santral-Hero asset using Nano Banana Pro (gemini-3-pro-image-preview).
 *
 * Output: public/images/hero-santral.png
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Load .env ---
(function loadEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
})();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY missing in .env');
  process.exit(1);
}

const OUT_DIR = join(ROOT, 'public', 'images');
mkdirSync(OUT_DIR, { recursive: true });
const OUT = join(OUT_DIR, 'hero-santral.png');

const PROMPT = `Ultra-detailed macro photograph of a vintage brass telephone-switchboard, shot on Arri Alexa with an anamorphic lens, shallow depth of field, 50mm macro equivalent. A single polished copper plug is suspended mid-air, frozen in motion, about to connect into an oxidized brass socket. Thin curved wires with patina sheen extend out of frame, catching rim-light. Chiaroscuro lighting: one warm tungsten key from the upper-left creating dramatic copper highlights on the plug, deep shadow dropping off to the lower-right. Background: aged beige-ecru parchment paper with faint pencil schematic markings, slightly out of focus. Color palette strictly constrained to: deep ink-black, oxidized copper, patina teal-green, warm paper ecru, single restrained ink-red accent stamp in the corner. Visible fine film grain, subtle anamorphic lens flare rendered as a thin horizontal line. Composition: off-center plug occupies left third, socket in right third, negative space above. Square 1:1 aspect. Absolutely no text, no typography, no watermarks, no logos. Cinematic, editorial, museum-quality print. Mood: industrial atelier, Ottoman-telegraph-archive meets Bauhaus precision.`;

async function main() {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  console.log('Generating hero-santral.png via Nano Banana Pro (gemini-3-pro-image-preview)...');
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ role: 'user', parts: [{ text: PROMPT }] }],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '1:1' },
    },
  });

  const parts = res?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) {
    console.error('No image returned. Full response:', JSON.stringify(res, null, 2).slice(0, 1200));
    process.exit(2);
  }

  const buf = Buffer.from(imgPart.inlineData.data, 'base64');
  writeFileSync(OUT, buf);
  console.log(`OK — wrote ${OUT} (${(buf.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error('FAIL:', e?.message || e);
  process.exit(1);
});
