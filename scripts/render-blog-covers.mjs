#!/usr/bin/env node
/**
 * Render Santral blog covers: Nano-Banana BG + Satori typography overlay.
 *
 * Flow per post:
 *   1. Read BG from public/blog-covers/bg-{slug}.png
 *   2. Build overlay via Satori (Fraunces H1 + mono labels + morse-pulse dot)
 *   3. Rasterize overlay SVG → PNG via @resvg/resvg-js
 *   4. Composite BG (darkened, cropped 1200×630) + overlay via sharp
 *   5. Write to public/blog-covers/{slug}.png
 *
 * Fonts fetched once at startup from Google Fonts (cached in .cache/fonts/).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BG_DIR = join(ROOT, 'public', 'blog-covers');
const OUT_DIR = BG_DIR;
const CACHE = join(ROOT, '.cache', 'fonts');
mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const W = 1200;
const H = 630;

const POSTS = [
  { slug: 'n8n-make-zapier-hangisi',              eyebrow: 'KARŞILAŞTIRMA · CLUSTER E',   category: 'AUTOMATION',  readTime: 6,  title: 'n8n mi, Make mi, Zapier mi?',                                                 sub: 'Türkiye için Karar Rehberi' },
  { slug: 'yapay-zeka-otomasyonu-nedir',          eyebrow: 'REHBER · B — PILLAR LIGHT',  category: 'AUTOMATION',  readTime: 9,  title: 'Yapay Zeka Otomasyonu Nedir?',                                                sub: 'Türkiye İçin Gerçekçi Rehber' },
  { slug: 'sirketler-icin-yapay-zeka-nereden-baslamali', eyebrow: 'PLAYBOOK · E — BAŞLANGIÇ', category: 'OPERATIONS', readTime: 8,  title: 'Şirketler İçin Yapay Zeka Otomasyonu',                                          sub: 'Nereden Başlamalı?' },
  { slug: 'yapay-zeka-isletim-sistemi-nedir',     eyebrow: 'PILLAR · A — FIRST MOVER',    category: 'STRATEGY',    readTime: 17, title: 'Yapay Zeka İşletim Sistemi (AIOS) Nedir?',                                    sub: "KOBİ'ler İçin İleri Düzey Rehber" },
  { slug: 'ai-otomasyon-ajansi-nedir',            eyebrow: 'RÖPORTAJ · C — INSIDER',      category: 'AUTOMATION',  readTime: 9,  title: 'AI Otomasyon Ajansı Nedir, Ne İş Yapar?',                                      sub: 'Dürüst 2026 Rehberi' },
];

// ─── Colors (Santral) ───────────────────────────────────────────
const C = {
  void: '#0E1216',
  paper: '#EDE3D2',
  paperDim: '#C5BCAB',
  paperMute: '#8A8271',
  copper: '#E09654',
  copperDim: '#B87A3D',
  hairline: 'rgba(237, 227, 210, 0.18)',
};

// ─── Font loading ───
// Fraunces: full TTF from undercasetype GitHub (includes full Latin Extended-A with Turkish İ Ş Ğ Ç Ü Ö)
// IBM Plex Mono/Sans: @fontsource latin-ext woff (has Turkish glyphs)
function loadFonts() {
  const NM = join(ROOT, 'node_modules');
  const files = [
    { path: join(CACHE, 'Fraunces9pt-Regular.ttf'), name: 'Fraunces', weight: 400, style: 'normal' },
    { path: join(CACHE, 'Fraunces9pt-Italic.ttf'),  name: 'Fraunces', weight: 400, style: 'italic' },
    { path: join(NM, '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-500-normal.woff'),name: 'PlexMono', weight: 500, style: 'normal' },
    { path: join(NM, '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-500-normal.woff'),name: 'PlexSans', weight: 500, style: 'normal' },
  ];
  return files.map((f) => ({ name: f.name, data: readFileSync(f.path), weight: f.weight, style: f.style }));
}

// ─── Overlay JSX (Satori uses React-like objects) ──────────────
function overlay(post) {
  return {
    type: 'div',
    props: {
      style: {
        width: W, height: H,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: 56,
        position: 'relative',
      },
      children: [
        // Top-left: eyebrow overline with morse-pulse dot
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 12 },
            children: [
              { type: 'div', props: { style: { width: 8, height: 8, borderRadius: 4, background: C.copper, boxShadow: `0 0 14px ${C.copper}` } } },
              { type: 'div', props: {
                style: { fontFamily: 'PlexMono', fontSize: 15, letterSpacing: 3.8, color: C.copper, textTransform: 'uppercase' },
                children: post.eyebrow
              }},
              { type: 'div', props: { style: { flex: 1, height: 1, background: C.hairline, marginLeft: 8 } } },
            ],
          },
        },
        // Middle-bottom block: title + subtitle
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', marginBottom: 36, maxWidth: 900 },
            children: [
              { type: 'div', props: {
                style: { fontFamily: 'Fraunces', fontSize: 64, color: C.paper, letterSpacing: -1.6, lineHeight: 1.05, fontWeight: 400 },
                children: post.title
              }},
              { type: 'div', props: {
                style: { fontFamily: 'Fraunces', fontSize: 38, color: C.copper, fontStyle: 'italic', letterSpacing: -0.8, lineHeight: 1.15, marginTop: 4, fontWeight: 400 },
                children: post.sub
              }},
            ],
          },
        },
        // Bottom strip: cat · read time · brand
        {
          type: 'div',
          props: {
            style: {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: 20, borderTop: `1px solid ${C.hairline}`,
              fontFamily: 'PlexMono', fontSize: 13, letterSpacing: 2.2, color: C.paperMute, textTransform: 'uppercase',
            },
            children: [
              { type: 'div', props: { style: {display:'flex',gap:24}, children: [
                { type: 'div', props: { children: `${post.category} · ${post.readTime} DK OKUMA` } },
              ]}},
              { type: 'div', props: { style: {display:'flex',alignItems:'center',gap:10,color: C.paperDim}, children: [
                { type: 'div', props: { style: {width:6,height:6,borderRadius:3,background:C.copper} } },
                { type: 'div', props: { children: 'PRATIK · YZ · yapayzekapratik.com' } },
              ]}},
            ],
          },
        },
      ],
    },
  };
}

async function renderCover(post, fonts) {
  console.log(`[${post.slug}] rendering…`);
  // 1) BG — load + resize + crop to 1200×630 + darken
  const bgPath = join(BG_DIR, `bg-${post.slug}.png`);
  if (!existsSync(bgPath)) throw new Error(`Missing BG: ${bgPath}`);
  const bgBuf = await sharp(bgPath)
    .resize(W, H, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.62, saturation: 0.82 })
    .toBuffer();

  // 2) Satori → SVG
  const svg = await satori(overlay(post), { width: W, height: H, fonts });

  // 3) Resvg → PNG (transparent overlay)
  const overlayPng = new Resvg(svg, { fitTo: { mode: 'width', value: W }, background: 'rgba(0,0,0,0)' }).render().asPng();

  // 4) Composite BG + gradient-darken-left + overlay
  //    Add a subtle left-to-right darkening gradient for text legibility
  const gradientSvg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"   stop-color="#0E1216" stop-opacity="0.88"/>
          <stop offset="0.55" stop-color="#0E1216" stop-opacity="0.55"/>
          <stop offset="1"   stop-color="#0E1216" stop-opacity="0.15"/>
        </linearGradient>
        <linearGradient id="bot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"   stop-color="#0E1216" stop-opacity="0"/>
          <stop offset="0.6" stop-color="#0E1216" stop-opacity="0.25"/>
          <stop offset="1"   stop-color="#0E1216" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="url(#bot)"/>
    </svg>
  `);

  await sharp(bgBuf)
    .composite([
      { input: gradientSvg, blend: 'over' },
      { input: overlayPng,  blend: 'over' },
    ])
    .png({ quality: 92, compressionLevel: 9 })
    .toFile(join(OUT_DIR, `${post.slug}.png`));

  console.log(`[${post.slug}] ✓ → blog-covers/${post.slug}.png`);
}

(async () => {
  console.log('Loading fonts…');
  const fonts = loadFonts();
  console.log(`Fonts ready (${fonts.length}).\nRendering ${POSTS.length} covers…\n`);
  for (const post of POSTS) {
    try { await renderCover(post, fonts); }
    catch (e) { console.error(`[${post.slug}] FAIL — ${e?.message || e}`); }
  }
  console.log('\nAll done.');
})().catch((e) => { console.error('FATAL:', e); process.exit(1); });
