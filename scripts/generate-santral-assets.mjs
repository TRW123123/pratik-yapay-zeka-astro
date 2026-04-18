#!/usr/bin/env node
/**
 * Generate multiple Santral assets via Nano Banana Pro.
 * Runs all prompts in parallel, writes to public/images/.
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

(function loadEnv() {
  const p = join(ROOT, '.env');
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
})();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error('GEMINI_API_KEY missing'); process.exit(1); }

const OUT_DIR = join(ROOT, 'public', 'images');
mkdirSync(OUT_DIR, { recursive: true });

const STYLE_SUFFIX = ' Shot on Arri Alexa with an anamorphic lens, shallow depth of field. Chiaroscuro lighting: warm tungsten key from the upper-left creating copper highlights, deep shadow dropping off. Color palette strictly: deep ink-black, oxidized copper, patina teal-green, warm paper ecru, single restrained ink-red accent stamp if any. Visible fine film grain, subtle anamorphic lens flare as a thin horizontal line. Absolutely no text, no typography, no watermarks, no logos. Cinematic, editorial, museum-quality print. Mood: industrial atelier, Ottoman-telegraph-archive meets Bauhaus precision. Square 1:1.';

const ASSETS = [
  {
    file: 'about-operator.png',
    prompt: `Ultra-detailed macro photograph of a craftsman's hand gently holding a polished copper switchboard plug above an aged blueprint with faint pencil-drawn schematic lines and a vintage brass fountain pen resting beside it. Parchment paper backdrop slightly yellowed at the edges. Shallow DoF on the plug, blueprint softly out of focus. A single tiny wax seal in ink-red is visible in the bottom-left corner. Composition: hand+plug left-center, pen and paper receding to the right.${STYLE_SUFFIX}`,
  },
  {
    file: 'contact-bridge.png',
    prompt: `Ultra-detailed macro photograph of two copper patch cables connecting across the panel of a vintage brass telephone switchboard — one plug just inserted into its oxidized brass socket, the other mid-air in the process of connecting. A single soft rim-light glints off the newly-connected plug. Parchment paper partially visible at top with a faint wiring diagram. Shallow DoF on the connected plug. A small ink-red "A-7" stamp in the lower-left.${STYLE_SUFFIX}`,
  },
  {
    file: 'checklist-brief.png',
    prompt: `Ultra-detailed macro photograph of a hand-bound paper dossier lying open on a matte dark workbench. Visible at the top a masthead-line of embossed copper ink. The right page shows five handwritten checklist items each ticked with a small copper-stamped checkmark. A brass measuring ruler partially overlaps the left page. Soft warm key-light from upper-left, deep shadow right. No readable text — only illegible pencil strokes suggesting a list. A tiny ink-red numeric stamp at the top-right corner.${STYLE_SUFFIX}`,
  },
  {
    file: 'chatgpt-module.png',
    prompt: `Ultra-detailed macro photograph of a modular brass-and-copper relay cartridge (resembling a small rectangular radio-valve unit) placed upright on parchment paper. Thin curved copper wires extend downward out of frame, catching rim-light. The unit's front face shows three circular brass terminals arranged vertically, each reflecting the warm tungsten key-light. Oxidized patina visible on the edges. Shallow DoF on the cartridge. A small ink-red "LLM-01" stamp on the parchment in the bottom-left.${STYLE_SUFFIX}`,
  },
];

async function generateOne(asset) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  console.log(`[${asset.file}] Generating...`);
  const res = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: [{ role: 'user', parts: [{ text: asset.prompt }] }],
    config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1' } },
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  const imgPart = parts.find((p) => p.inlineData?.data);
  if (!imgPart) {
    console.error(`[${asset.file}] No image returned`);
    return { file: asset.file, ok: false };
  }
  const buf = Buffer.from(imgPart.inlineData.data, 'base64');
  const out = join(OUT_DIR, asset.file);
  writeFileSync(out, buf);
  console.log(`[${asset.file}] OK — ${(buf.length / 1024).toFixed(1)} KB`);
  return { file: asset.file, ok: true, bytes: buf.length };
}

(async () => {
  const results = await Promise.all(ASSETS.map(generateOne));
  console.log('\nDone:', results.map(r => `${r.file}:${r.ok ? 'OK' : 'FAIL'}`).join(' | '));
})().catch((e) => { console.error('FAIL:', e?.message || e); process.exit(1); });
