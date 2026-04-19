#!/usr/bin/env node
/**
 * Regenerate the 3 weaker Nano Banana Pro backgrounds with stronger prompts.
 * Generates 2 variants per post (best-of-2 picked manually after review).
 *
 * Keeps: telegraph-key (strong), patch-plug relays (strong)
 * Re-rolls: compass-blueprint, mainframe-panel, workshop-bench
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

const OUT_DIR = join(ROOT, 'public', 'blog-covers');
const VARIANTS_DIR = join(OUT_DIR, 'variants');
mkdirSync(VARIANTS_DIR, { recursive: true });

// Stronger style directive — emphasis on SINGLE hero object, dramatic light,
// clear subject-background separation
const STYLE = ` Shot on Arri Alexa 65mm prime lens, f/2.0, shallow depth of field (strong bokeh).
Dramatic chiaroscuro lighting — ONE tungsten key light from upper-left at 30-degree angle, carving rim-light on subject edges.
Deep shadow on right third (CRITICAL: right third must be ~90% black for text overlay).
Single clear hero object in left-center, tack-sharp focus.
Strict palette: deep ink-black (#0E1216) dominant, oxidized copper (#B87A3D) and warm brass highlights ONLY on the hero object, muted paper-ecru (#EDE3D2) soft accents, one restrained wax-red seal.
Visible fine film grain, subtle anamorphic horizontal flare through highlight.
ABSOLUTELY NO TEXT, NO TYPOGRAPHY, NO WRITING, NO LETTERS, NO LOGOS, NO NUMBERS, NO WATERMARKS — composition is pure objects and light.
Museum-quality editorial photograph, Ottoman-telegraph-archive meets Bauhaus precision, National Geographic cover feel.
Landscape 16:9.`;

const POSTS = [
  {
    slug: 'sirketler-icin-yapay-zeka-nereden-baslamali',
    prompt: `Ultra-detailed macro photograph. ONE large hand-drawn strategic blueprint parchment laid flat on dark workbench, its folds catching the key-light. A SINGLE oxidized-copper survey pin is stabbed into the parchment at the left-center, casting a long hard shadow to the right. Next to the pin: a small brass compass with its needle tilted forward-right, glass reflecting a single highlight. The parchment has abstract topographic contour lines and faint survey marks (NO READABLE WORDS). Shallow depth of field on the copper pin. Right third of frame fades to deep darkness.${STYLE}`,
  },
  {
    slug: 'yapay-zeka-isletim-sistemi-nedir',
    prompt: `Ultra-detailed macro photograph. ONE massive oxidized-copper master dial (15cm diameter) centered-left, with a polished brass needle pointing upward-right. Around it, THREE smaller secondary brass dials at varying depth — tack sharp focus ONLY on the master dial's needle tip. Each dial has hand-engraved tick marks (NO READABLE WORDS or numbers). Deep patina-green oxidation on the copper bezel. Single amber pilot-lamp jewel glows faintly between the dials. Right third of frame is DEEP BLACK void. Key light rakes across the master dial from upper-left, creating dramatic rim-highlight on the needle.${STYLE}`,
  },
  {
    slug: 'ai-otomasyon-ajansi-nedir',
    prompt: `Ultra-detailed macro photograph. ONE ink-red wax seal pressed fresh onto creamy parchment, centered-left, the wax still glossy, a brass seal-matrix resting at an angle beside it. Behind the parchment: a neat row of 4 precision craftsman tools (brass awl, copper ruler, small hammer, burnishing tool) in soft rim-light, out of focus but readable as tools. Parchment edges catch warm tungsten light. Tack-sharp focus on the wax seal's imprint detail. Right third fades to darkness with a single soft amber bokeh. Sense of honest craft, deliberate mark-making, no shortcuts.${STYLE}`,
  },
];

async function generateVariant(post, variant) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const fileName = `bg-${post.slug}-v${variant}.png`;
  const outPath = join(VARIANTS_DIR, fileName);
  console.log(`[${post.slug}/v${variant}] Generating…`);
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts: [{ text: post.prompt }] }],
      config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    });
    const parts = res?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    if (!imgPart) { console.error(`[${post.slug}/v${variant}] No image`); return { slug: post.slug, variant, ok: false }; }
    const buf = Buffer.from(imgPart.inlineData.data, 'base64');
    writeFileSync(outPath, buf);
    console.log(`[${post.slug}/v${variant}] OK — ${(buf.length / 1024).toFixed(1)} KB → variants/${fileName}`);
    return { slug: post.slug, variant, ok: true };
  } catch (e) {
    console.error(`[${post.slug}/v${variant}] FAIL — ${e?.message || e}`);
    return { slug: post.slug, variant, ok: false };
  }
}

(async () => {
  // Generate 2 variants per weak post in parallel (6 total)
  const jobs = [];
  for (const post of POSTS) {
    jobs.push(generateVariant(post, 1));
    jobs.push(generateVariant(post, 2));
  }
  const results = await Promise.all(jobs);
  console.log('\nDone:');
  results.forEach(r => console.log(`  ${r.slug}/v${r.variant}: ${r.ok ? 'OK' : 'FAIL'}`));
})().catch((e) => { console.error('FAIL:', e?.message || e); process.exit(1); });
