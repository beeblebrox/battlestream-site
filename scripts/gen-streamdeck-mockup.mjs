// Generates a Stream Deck MK.2 mockup for the battlestream-site landing page.
// Re-implements src/render.ts renderButton() exactly, then composes 15 keys
// onto a device-style bezel. Run from streamdeck-plugin/:
//   node scripts/gen-site-mockup.mjs <output.png>
import { createCanvas, loadImage } from '@napi-rs/canvas';
import path from 'node:path';
import fs from 'node:fs';

const IMGS_DIR = path.resolve(process.cwd(), 'imgs', 'actions');
const OUT = process.argv[2] ?? 'streamdeck-mockup.png';

const SIZE = 144;

function fitText(ctx, text, maxWidth, maxSize, weight, minSize) {
  let size = maxSize;
  ctx.font = `${weight} ${size}px sans-serif`;
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 1;
    ctx.font = `${weight} ${size}px sans-serif`;
  }
}

function drawGradientBg(ctx, gradient) {
  const [c1, c2] = gradient;
  const grd = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  grd.addColorStop(0, c1);
  grd.addColorStop(1, c2);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

async function renderKey({ label, value, subtitle, gradient, icon }) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  const iconPath = icon ? path.join(IMGS_DIR, `${icon}.png`) : undefined;
  if (iconPath && fs.existsSync(iconPath)) {
    const img = await loadImage(iconPath);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, SIZE, SIZE);
  } else {
    drawGradientBg(ctx, gradient);
  }

  const PAD = 12;
  const maxW = SIZE - PAD * 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  fitText(ctx, label.toUpperCase(), maxW, 17, 'bold', 10);
  ctx.fillText(label.toUpperCase(), SIZE / 2, 30);

  ctx.fillStyle = '#ffffff';
  fitText(ctx, value, maxW, 52, 'bold', 14);
  ctx.fillText(value, SIZE / 2, 82);

  if (subtitle) {
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    fitText(ctx, subtitle, maxW, 14, 'normal', 8);
    ctx.fillText(subtitle, SIZE / 2, 122);
  }

  return canvas;
}

// A realistic mid-game snapshot: turn 12 recruit phase, quilboar/beetle lobby.
const KEYS = [
  // row 1 — core stats
  { label: 'HEALTH',   value: '23',      subtitle: '/ 30',           gradient: ['#7b0000', '#c0392b'], icon: 'health' },
  { label: 'ARMOR',    value: '5',       subtitle: '',               gradient: ['#3d0000', '#922b21'], icon: 'armor' },
  { label: 'TIER',     value: '4',       subtitle: '',               gradient: ['#1a3a00', '#27ae60'], icon: 'tavern-tier' },
  { label: 'GOLD',     value: '10',      subtitle: '',               gradient: ['#5c4a00', '#d4a017'], icon: 'gold' },
  { label: 'TURN',     value: '12',      subtitle: '',               gradient: ['#1a1a3a', '#5d6d7e'], icon: 'turn' },
  // row 2 — game flow
  { label: 'PHASE',    value: 'BUY',     subtitle: '',               gradient: ['#1a0030', '#6c3483'], icon: 'phase' },
  { label: 'TRIPLES',  value: '2',       subtitle: '',               gradient: ['#2d0060', '#8e44ad'], icon: 'triples' },
  { label: 'WIN STR.', value: '3',       subtitle: '',               gradient: ['#003366', '#2980b9'], icon: 'win-streak' },
  { label: 'MINIONS',  value: '7',       subtitle: '',               gradient: ['#003030', '#1abc9c'], icon: 'minion-count' },
  { label: 'TRIBES',   value: '5',       subtitle: 'QLB,BST,DRG,N…', gradient: ['#1a1a2e', '#8e44ad'], icon: 'tribes' },
  // row 3 — buff sources (Dyn Buttons in action)
  { label: 'BLOODGEM', value: '+6/+3',   subtitle: '',               gradient: ['#3a1a00', '#e67e22'], icon: 'bloodgem-buff' },
  { label: 'BEETLES',  value: '+12/+12', subtitle: '',               gradient: ['#120a20', '#4a3070'], icon: 'beetle-buff' },
  { label: 'WHELPS',   value: '+8/+8',   subtitle: '',               gradient: ['#120a20', '#4a3070'], icon: 'whelp-buff' },
  { label: 'SPELLS',   value: '36',      subtitle: '',               gradient: ['#1a001a', '#8e44ad'], icon: 'spells-cast' },
  { label: 'ALL BUFFS', value: '+26/+23', subtitle: '',              gradient: ['#1a1a2e', '#8b0000'], icon: 'total-buffs' },
];

const COLS = 5, ROWS = 3;
const GAP = 30;          // gap between keys
const BEZEL = 72;        // bezel around the key grid
const KEY_RADIUS = 24;   // rounded key corners
const DEVICE_RADIUS = 40;

const W = BEZEL * 2 + COLS * SIZE + (COLS - 1) * GAP;
const H = BEZEL * 2 + ROWS * SIZE + (ROWS - 1) * GAP;

function roundedPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const out = createCanvas(W, H);
const octx = out.getContext('2d');

// device body
const body = octx.createLinearGradient(0, 0, 0, H);
body.addColorStop(0, '#23232a');
body.addColorStop(0.5, '#17171c');
body.addColorStop(1, '#101014');
roundedPath(octx, 0, 0, W, H, DEVICE_RADIUS);
octx.fillStyle = body;
octx.fill();

// subtle top edge highlight
roundedPath(octx, 1.5, 1.5, W - 3, H - 3, DEVICE_RADIUS - 1);
octx.strokeStyle = 'rgba(255,255,255,0.07)';
octx.lineWidth = 2;
octx.stroke();

// faceplate inset around the key grid
const FACE_PAD = 26;
roundedPath(
  octx,
  BEZEL - FACE_PAD, BEZEL - FACE_PAD,
  COLS * SIZE + (COLS - 1) * GAP + FACE_PAD * 2,
  ROWS * SIZE + (ROWS - 1) * GAP + FACE_PAD * 2,
  28,
);
octx.fillStyle = 'rgba(0,0,0,0.45)';
octx.fill();
octx.strokeStyle = 'rgba(255,255,255,0.04)';
octx.lineWidth = 1.5;
octx.stroke();

for (let i = 0; i < KEYS.length; i++) {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const x = BEZEL + col * (SIZE + GAP);
  const y = BEZEL + row * (SIZE + GAP);

  const key = await renderKey(KEYS[i]);

  // key well (slightly larger dark rim behind each key)
  roundedPath(octx, x - 5, y - 5, SIZE + 10, SIZE + 10, KEY_RADIUS + 5);
  octx.fillStyle = '#000000';
  octx.fill();

  // rounded-clip the key face
  octx.save();
  roundedPath(octx, x, y, SIZE, SIZE, KEY_RADIUS);
  octx.clip();
  octx.drawImage(key, x, y);
  octx.restore();

  // glass sheen on the key face
  octx.save();
  roundedPath(octx, x, y, SIZE, SIZE, KEY_RADIUS);
  octx.clip();
  const sheen = octx.createLinearGradient(x, y, x, y + SIZE * 0.5);
  sheen.addColorStop(0, 'rgba(255,255,255,0.10)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  octx.fillStyle = sheen;
  octx.fillRect(x, y, SIZE, SIZE * 0.5);
  octx.restore();
}

fs.writeFileSync(OUT, out.toBuffer('image/png'));
console.log(`wrote ${OUT} (${W}x${H})`);
