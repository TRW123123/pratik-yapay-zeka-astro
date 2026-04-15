import { createCanvas } from '@napi-rs/canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const WIDTH = 1200;
const HEIGHT = 630;

const sectors = [
  { slug: 'saglik', title: 'Sağlık Sektöründe\nYapay Zeka', icon: '🏥' },
  { slug: 'egitim', title: 'Eğitim Sektöründe\nYapay Zeka', icon: '🎓' },
  { slug: 'restoran', title: 'Restoran Sektöründe\nYapay Zeka', icon: '🍽️' },
  { slug: 'eczane', title: 'Eczane Sektöründe\nYapay Zeka', icon: '💊' },
  { slug: 'chatbot', title: 'Kurumsal Chatbot\nOtomasyonu', icon: '🤖' },
  { slug: 'enerji', title: 'Enerji Sektöründe\nYapay Zeka', icon: '⚡' },
  { slug: 'whatsapp', title: 'WhatsApp İşletme\nOtomasyonu', icon: '💬' },
  { slug: 'klinik', title: 'Klinikler İçin\nYapay Zeka', icon: '🩺' },
  { slug: 'hastane', title: 'Hastaneler İçin\nYapay Zeka', icon: '🏨' },
  { slug: 'doktor', title: 'Doktorlar İçin\nYapay Zeka', icon: '👨‍⚕️' },
  { slug: 'hotel', title: 'Otel Sektöründe\nYapay Zeka', icon: '🏨' },
  { slug: 'kurs', title: 'Kurs Merkezleri İçin\nYapay Zeka', icon: '📚' },
  { slug: 'email', title: 'E-Posta Outreach\nOtomasyonu', icon: '📧' },
  { slug: 'finans', title: 'Finans Sektöründe\nYapay Zeka', icon: '📊' },
  { slug: 'mimarlik', title: 'Mimarlık Sektöründe\nYapay Zeka', icon: '📐' },
];

const PRIMARY = '#22D3EE';
const BG_DARK = '#0B0F14';
const BG_CARD = '#131920';

for (const sector of sectors) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  grad.addColorStop(0, BG_DARK);
  grad.addColorStop(1, BG_CARD);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }

  // Glow circle behind icon
  const glowGrad = ctx.createRadialGradient(600, 200, 0, 600, 200, 250);
  glowGrad.addColorStop(0, 'rgba(34, 211, 238, 0.15)');
  glowGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(600, 200, 250, 0, Math.PI * 2);
  ctx.fill();

  // Accent line top
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(80, 60, 60, 4);

  // Badge "Sektörel Çözüm"
  ctx.fillStyle = 'rgba(34, 211, 238, 0.1)';
  roundRect(ctx, 80, 80, 200, 36, 18);
  ctx.fill();
  ctx.fillStyle = PRIMARY;
  ctx.font = '600 14px "Segoe UI", Arial, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('SEKTÖREL ÇÖZÜM', 105, 103);

  // Main title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 56px "Segoe UI", Arial, sans-serif';
  const lines = sector.title.split('\n');
  lines.forEach((line, i) => {
    ctx.fillText(line, 80, 190 + i * 70);
  });

  // Separator line
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(80, 340, 100, 3);

  // Subtitle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '400 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Otomasyon Sistemleri ve Yapay Zeka Entegrasyonu', 80, 385);

  // Bottom branding bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, HEIGHT - 80, WIDTH, 80);

  // Brand line
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(0, HEIGHT - 80, WIDTH, 2);

  // Brand name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
  ctx.fillText('Pratik Yapay Zeka', 80, HEIGHT - 35);

  // Domain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '400 16px "Segoe UI", Arial, sans-serif';
  ctx.fillText('yapayzekapratik.com', WIDTH - 250, HEIGHT - 35);

  // Right side decorative element
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(WIDTH - 150, 300, 120, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(WIDTH - 150, 300, 80, 0.5, Math.PI * 1.2);
  ctx.stroke();

  // Save
  const buffer = canvas.toBuffer('image/jpeg', 90);
  const outPath = join(import.meta.dirname, '..', 'public', `og-${sector.slug}.jpg`);
  writeFileSync(outPath, buffer);
  console.log(`✓ og-${sector.slug}.jpg (${(buffer.length / 1024).toFixed(0)} KB)`);
}

console.log(`\nDone: ${sectors.length} OG images generated.`);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
