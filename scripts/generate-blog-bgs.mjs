#!/usr/bin/env node
/**
 * Generate Nano Banana Pro backgrounds for the 5 published TR blog posts.
 * Output: public/blog-covers/bg-{slug}.png (1536×1024 → will be cropped to 1200×630 in render step)
 *
 * Santral aesthetic: industrial atelier, oxidized copper, paper-ecru, ink accents,
 * Arri Alexa cinematic palette — SAME directive as cat-* category assets.
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
mkdirSync(OUT_DIR, { recursive: true });

const STYLE = ' Shot on Arri Alexa with anamorphic lens, shallow depth of field, cinematic chiaroscuro with tungsten key from upper-left. Strict palette: deep ink-black (#0E1216), oxidized copper (#B87A3D) highlights, patina teal-green accent, warm paper ecru (#EDE3D2), one restrained wax-red stamp. Visible fine film grain, subtle anamorphic horizontal flare. ABSOLUTELY NO TEXT, NO TYPOGRAPHY, NO WRITING, NO LETTERS, NO LOGOS, NO WATERMARKS, NO NUMBERS. Empty of all written symbols — composition is purely objects, materials, light. Ottoman-telegraph-archive meets Bauhaus precision. Landscape 16:9, negative space on right third for typography overlay.';

const POSTS = [
  {
    slug: 'n8n-make-zapier-hangisi',
    prompt: `Wide landscape macro photograph of three oxidized-copper patch-plug relays in a dark switchboard, each plug subtly different — one slightly favored by rim-light, heavier brass weight, central. Copper wire tracings fan out to the right but fade into darkness leaving clean negative space on the right third for text. Shallow depth of field on the central plug. Sense of decision, of weighing three near-identical options.${STYLE}`,
  },
  {
    slug: 'yapay-zeka-otomasyonu-nedir',
    prompt: `Wide landscape macro photograph of a vintage brass telegraph-key with copper contact points on the left third, connected by taut copper wires disappearing into the dark right half of the frame — the wires glow faintly where they catch rim-light. A single blank parchment page lies at an angle under the key, waiting to be marked. Shallow depth of field on the key's contact screw. Sense of primordial automation, first signal sent.${STYLE}`,
  },
  {
    slug: 'sirketler-icin-yapay-zeka-nereden-baslamali',
    prompt: `Wide landscape macro photograph of an open brass compass on an architectural blueprint-parchment, the compass needle pointing off-frame to the right. Compass sits at the left-center, a fountain pen and small brass measuring caliper nearby. Handwritten ink notations on parchment edges only — but no readable words, just abstract flourishes. Right third kept clean and darker for text overlay. Shallow depth of field on compass needle tip. Sense of careful planning before the first move.${STYLE}`,
  },
  {
    slug: 'yapay-zeka-isletim-sistemi-nedir',
    prompt: `Wide landscape macro photograph of a massive oxidized-copper mainframe-style control panel with dozens of brass toggle switches, patina dials, and small pilot-lamp jewels — SOME dimly lit copper-orange, creating a constellation on the left two-thirds. Right third fades to deep ink-black negative space. Shallow depth of field on one central dial. Sense of a vast operating system laid bare as physical infrastructure.${STYLE}`,
  },
  {
    slug: 'ai-otomasyon-ajansi-nedir',
    prompt: `Wide landscape macro photograph of a dark workshop bench with hand-tools of an artisan: a brass awl, a copper ruler, three patinated precision weights, a hand-bound leather dossier partially open revealing blank parchment pages. An ink-red wax stamp rests beside an unfilled brass seal-matrix. Left two-thirds composition, right third clean negative space for text. Shallow depth of field on the wax stamp. Sense of honest craft, tools-not-talk.${STYLE}`,
  },
];

async function generateOne(post) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const fileName = `bg-${post.slug}.png`;
  const outPath = join(OUT_DIR, fileName);
  console.log(`[${post.slug}] Generating Nano Banana bg…`);
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts: [{ text: post.prompt }] }],
      config: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
    });
    const parts = res?.candidates?.[0]?.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData?.data);
    if (!imgPart) { console.error(`[${post.slug}] No image returned`); return { slug: post.slug, ok: false }; }
    const buf = Buffer.from(imgPart.inlineData.data, 'base64');
    writeFileSync(outPath, buf);
    console.log(`[${post.slug}] OK — ${(buf.length / 1024).toFixed(1)} KB → ${fileName}`);
    return { slug: post.slug, ok: true };
  } catch (e) {
    console.error(`[${post.slug}] FAIL — ${e?.message || e}`);
    return { slug: post.slug, ok: false };
  }
}

(async () => {
  const results = await Promise.all(POSTS.map(generateOne));
  console.log('\nDone:', results.map(r => `${r.slug}:${r.ok ? 'OK' : 'FAIL'}`).join(' | '));
  const failed = results.filter(r => !r.ok);
  if (failed.length) process.exit(1);
})().catch((e) => { console.error('FAIL:', e?.message || e); process.exit(1); });
