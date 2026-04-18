#!/usr/bin/env node
/**
 * Generate 6 category cover-assets for Santral — Services/Vaka/Calculator groups.
 * All run in parallel.
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

const STYLE = ' Shot on Arri Alexa with anamorphic lens, shallow depth of field. Chiaroscuro tungsten key from upper-left, copper highlights, deep shadows. Strict palette: deep ink-black, oxidized copper, patina teal-green, warm paper ecru, single restrained ink-red stamp accent. Visible fine film grain, subtle anamorphic horizontal flare. No text, no typography, no watermarks, no logos. Cinematic, editorial, museum-quality print. Industrial atelier / Ottoman-telegraph-archive meets Bauhaus precision. Square 1:1.';

const ASSETS = [
  {
    file: 'cat-growth.png',
    prompt: `Ultra-detailed macro photograph of a vertical copper busbar with five glowing brass patch-plugs inserted at different heights — each plug seated firmly, catching rim-light. Thin copper wires trail off to the right, out of focus. Parchment with faint "Outbound" handwritten annotations peeks from behind. Shallow DoF on the middle plug. A small ink-red "GROWTH" seal at lower-left corner.${STYLE}`,
  },
  {
    file: 'cat-operations.png',
    prompt: `Ultra-detailed macro photograph of an aged accountant's ledger page covered with handwritten tally marks and Roman-numeral column headers. A brass abacus sits atop the page at an angle. A fountain pen rests in the crease. Soft shadow from an oil lamp at upper-left. Shallow DoF on the abacus. A small ink-red "OPS" wax seal on the lower-right.${STYLE}`,
  },
  {
    file: 'cat-hr.png',
    prompt: `Ultra-detailed macro photograph of a rolled-up parchment scroll partially unfurled on a dark workbench, showing columns of neatly handwritten names with brass check-marks stamped beside each. A brass employee-badge with serial number rests atop the scroll. Shallow DoF on the badge. A small ink-red "PERSONEL" seal on the corner of the scroll.${STYLE}`,
  },
  {
    file: 'cat-finance.png',
    prompt: `Ultra-detailed macro photograph of a handwritten tax-ledger page with stamped red "ÖDENDI" (PAID) imprints next to each entry. A brass fountain pen and an oxidized copper inkwell rest beside the page. Shallow DoF on the inkwell's curved lip. A small ink-red "FINANS" corner seal.${STYLE}`,
  },
  {
    file: 'cat-commerce.png',
    prompt: `Ultra-detailed macro photograph of a brass mechanical weighing scale with a small copper box on one pan and a stack of patina-coated measuring weights on the other. A wooden crate corner and rope visible in background. Shallow DoF on the scale pivot. A small ink-red "TİCARET" seal on the crate.${STYLE}`,
  },
  {
    file: 'cat-archive.png',
    prompt: `Ultra-detailed macro photograph of an antique brass-handled wooden filing cabinet drawer pulled open, revealing rows of parchment case-dossiers with copper-stamped spine labels. A single dossier partially extracted catches rim-light. Shallow DoF on the extracted dossier. A small ink-red "ARŞIV" seal on the drawer-front.${STYLE}`,
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
  if (!imgPart) { console.error(`[${asset.file}] No image`); return { file: asset.file, ok: false }; }
  const buf = Buffer.from(imgPart.inlineData.data, 'base64');
  writeFileSync(join(OUT_DIR, asset.file), buf);
  console.log(`[${asset.file}] OK — ${(buf.length / 1024).toFixed(1)} KB`);
  return { file: asset.file, ok: true };
}

(async () => {
  const results = await Promise.all(ASSETS.map(generateOne));
  console.log('\nDone:', results.map(r => `${r.file}:${r.ok ? 'OK' : 'FAIL'}`).join(' | '));
})().catch((e) => { console.error('FAIL:', e?.message || e); process.exit(1); });
