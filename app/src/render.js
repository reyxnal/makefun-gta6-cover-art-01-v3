// Cover renderer: draws the multi-panel GTA-style poster onto any canvas.
// Everything is drawn from the state object — photos, words, grade, layout,
// size and finish — so the on-screen preview and the exported PNG are the
// exact same drawing at different pixel sizes.
import { gradeById } from './grades.js';

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: '1080 × 1080 · Square post' },
  '1080x1350': { w: 1080, h: 1350, label: '1080 × 1350 · Portrait post' },
  '1920x1080': { w: 1920, h: 1080, label: '1920 × 1080 · Landscape post' },
};

export const LAYOUTS = {
  nights: { label: 'Nights', panels: 4 },
  triptych: { label: 'Triptych', panels: 3 },
  duo: { label: 'Duo', panels: 3 },
};

function panelRects(layout, w, h) {
  if (layout === 'triptych') {
    const third = w / 3;
    return [
      { x: 0, y: 0, w: third, h },
      { x: third, y: 0, w: third, h },
      { x: third * 2, y: 0, w: third, h },
    ];
  }
  if (layout === 'duo') {
    return [
      { x: 0, y: 0, w: w / 2, h: h * 0.76 },
      { x: w / 2, y: 0, w: w / 2, h: h * 0.76 },
      { x: 0, y: h * 0.76, w, h: h * 0.24 },
    ];
  }
  // nights: hero + two stacked + bottom strip
  return [
    { x: 0, y: 0, w: w * 0.62, h: h * 0.78 },
    { x: w * 0.62, y: 0, w: w * 0.38, h: h * 0.39 },
    { x: w * 0.62, y: h * 0.39, w: w * 0.38, h: h * 0.39 },
    { x: 0, y: h * 0.78, w, h: h * 0.22 },
  ];
}

export function panelAt(layout, px, py, w, h) {
  const rects = panelRects(layout, w, h);
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i];
    if (px >= r.x && px < r.x + r.w && py >= r.y && py < r.y + r.h) return i;
  }
  return 0;
}

function drawPhotoInto(ctx, img, rect, pan, grade) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const zoom = pan.zoom || 1;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + (pan.panX || 0) * rect.w * 0.01;
  const dy = rect.y + (rect.h - dh) / 2 + (pan.panY || 0) * rect.h * 0.01;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.filter = `saturate(${grade.saturate}) contrast(${grade.contrast}) brightness(${grade.brightness})`;
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.filter = 'none';
  // neon wash: warm light from below, cool light from above
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.55;
  const wash = ctx.createLinearGradient(rect.x, rect.y, rect.x, rect.y + rect.h);
  wash.addColorStop(0, grade.deep);
  wash.addColorStop(1, grade.wash);
  ctx.fillStyle = wash;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawEmptyPanel(ctx, rect, grade, index) {
  const g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
  g.addColorStop(0, grade.skyTop);
  g.addColorStop(1, grade.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `700 ${Math.max(14, rect.w * 0.045)}px "Segoe UI", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`+  PHOTO ${index + 1}`, rect.x + rect.w / 2, rect.y + rect.h / 2);
}

function chromeTitle(ctx, text, cx, y, size, grade, maxWidth) {
  ctx.save();
  ctx.translate(cx, y);
  ctx.transform(1, 0, -0.12, 1, 0, 0);
  ctx.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let fit = size;
  while (fit > 12 && ctx.measureText(text).width > maxWidth) {
    fit -= 4;
    ctx.font = `900 ${fit}px "Arial Black", Arial, sans-serif`;
  }
  const grad = ctx.createLinearGradient(0, -fit * 0.55, 0, fit * 0.55);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.45, grade.accentA);
  grad.addColorStop(0.75, grade.accentB);
  grad.addColorStop(1, '#ffffff');
  ctx.lineWidth = Math.max(3, fit * 0.09);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(10,4,20,0.92)';
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = grad;
  ctx.fillText(text, 0, 0);
  ctx.restore();
  return fit;
}

function filmGrain(ctx, w, h, amount, seed) {
  if (amount <= 0) return;
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const count = Math.floor((w * h * amount) / 90000);
  ctx.save();
  for (let i = 0; i < count; i++) {
    const v = next();
    ctx.fillStyle = v > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    ctx.globalAlpha = 0.05 + next() * 0.10;
    ctx.fillRect(next() * w, next() * h, 1.6, 1.6);
  }
  ctx.restore();
}

export function drawCover(canvas, state) {
  const size = SIZES[state.size] || SIZES['1080x1080'];
  const w = size.w;
  const h = size.h;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  const grade = gradeById(state.grade);
  const gap = Math.round(w * 0.006);
  const rects = panelRects(state.layout, w, h);
  const photos = state.photos || [];
  const pans = state.pans || [];

  // deep backdrop behind the gaps
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0a0614');
  bg.addColorStop(1, grade.skyTop);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  rects.forEach((r, i) => {
    const inset = {
      x: r.x + (i === 0 || r.x === 0 ? gap : gap / 2),
      y: r.y + (r.y === 0 ? gap : gap / 2),
      w: r.w - gap,
      h: r.h - gap,
    };
    const img = photos[i];
    if (img) drawPhotoInto(ctx, img, inset, pans[i] || {}, grade);
    else drawEmptyPanel(ctx, inset, grade, i);
    // neon frame
    ctx.save();
    ctx.strokeStyle = grade.frame;
    ctx.lineWidth = Math.max(2, w * 0.0022);
    ctx.shadowColor = grade.frame;
    ctx.shadowBlur = (state.glow / 100) * w * 0.012;
    ctx.strokeRect(inset.x, inset.y, inset.w, inset.h);
    ctx.restore();
  });

  // title band: dark gradient rising from the bottom
  const bandH = h * 0.26;
  const band = ctx.createLinearGradient(0, h - bandH, 0, h);
  band.addColorStop(0, 'rgba(8,3,18,0)');
  band.addColorStop(0.45, 'rgba(8,3,18,0.72)');
  band.addColorStop(1, 'rgba(8,3,18,0.94)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h - bandH, w, bandH);

  // kicker, top-left, letterspaced neon on a dark pill so it reads over
  // busy photos instead of colliding with a scene's own signage
  const kicker = (state.kicker || '').trim().toUpperCase();
  if (kicker) {
    ctx.save();
    const kSize = Math.round(w * 0.016);
    ctx.font = `700 ${kSize}px "Segoe UI", Arial, sans-serif`;
    const kText = kicker.split('').join(' ');
    const kWidth = ctx.measureText(kText).width;
    const kx = gap + w * 0.02;
    const ky = gap + h * 0.018;
    const padX = w * 0.012;
    const padY = h * 0.008;
    ctx.fillStyle = 'rgba(8,3,18,0.62)';
    ctx.beginPath();
    ctx.roundRect(kx - padX, ky - padY, kWidth + padX * 2, kSize + padY * 2, kSize * 0.5);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = grade.accentB;
    ctx.shadowBlur = w * 0.008;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(kText, kx, ky);
    ctx.restore();
  }

  // chrome title + subtitle, centred in the band
  const title = (state.title || 'NEON SHORES').toUpperCase();
  const titleSize = Math.round(w * 0.085);
  chromeTitle(ctx, title, w / 2, h - bandH * 0.42, titleSize, grade, w * 0.94);
  const subtitle = (state.subtitle || '').trim();
  if (subtitle) {
    ctx.save();
    ctx.font = `italic 600 ${Math.round(w * 0.02)}px Georgia, "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowColor = grade.accentA;
    ctx.shadowBlur = w * 0.004;
    ctx.fillText(subtitle, w / 2, h - bandH * 0.16);
    ctx.restore();
  }

  // vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(5,2,12,0.42)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  filmGrain(ctx, w, h, state.grain / 100, 20261119);
  return { w, h };
}

export function exportCoverPNG(state) {
  const off = document.createElement('canvas');
  drawCover(off, state);
  return new Promise((resolve, reject) => {
    off.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('PNG export failed'));
    }, 'image/png');
  });
}
