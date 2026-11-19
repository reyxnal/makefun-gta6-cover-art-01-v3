// Procedural sample photos: every scene is drawn in code on an offscreen
// canvas, so the app ships no photographs at all — no real people, no
// borrowed artwork. Three Vice City nights scenes, each deterministic from
// its seed so the same sample always looks the same.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, w, h, top, mid, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(0.55, mid);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sunDisc(ctx, x, y, r, core, halo) {
  const haloGrad = ctx.createRadialGradient(x, y, r * 0.4, x, y, r * 2.6);
  haloGrad.addColorStop(0, halo);
  haloGrad.addColorStop(1, 'rgba(255,120,80,0)');
  ctx.fillStyle = haloGrad;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#fff7d6');
  g.addColorStop(0.7, core);
  g.addColorStop(1, '#ff5e3a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function stars(ctx, w, h, rnd, n) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < n; i++) {
    const x = rnd() * w;
    const y = rnd() * h * 0.35;
    const r = 0.6 + rnd() * 1.4;
    ctx.globalAlpha = 0.25 + rnd() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function buildings(ctx, w, horizon, rnd, palette) {
  let x = -10;
  while (x < w + 10) {
    const bw = 60 + rnd() * 130;
    const bh = 90 + rnd() * 240;
    const shade = palette[Math.floor(rnd() * palette.length)];
    ctx.fillStyle = shade;
    ctx.fillRect(x, horizon - bh, bw, bh);
    // lit windows
    for (let wy = horizon - bh + 12; wy < horizon - 14; wy += 22) {
      for (let wx = x + 10; wx < x + bw - 12; wx += 20) {
        if (rnd() < 0.42) {
          ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,214,120,0.95)' : 'rgba(120,240,255,0.9)';
          ctx.fillRect(wx, wy, 8, 11);
        }
      }
    }
    // rooftop antenna
    if (rnd() < 0.5) {
      ctx.strokeStyle = shade;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + bw / 2, horizon - bh);
      ctx.lineTo(x + bw / 2, horizon - bh - 26);
      ctx.stroke();
      ctx.fillStyle = '#ff2e55';
      ctx.beginPath();
      ctx.arc(x + bw / 2, horizon - bh - 28, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    x += bw + 4 + rnd() * 22;
  }
}

function palm(ctx, x, baseY, s, lean, dark) {
  ctx.save();
  ctx.translate(x, baseY);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = dark;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 6, -140);
  ctx.stroke();
  ctx.lineWidth = 6;
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + i * 0.14);
    const len = 52 - i * 3;
    ctx.beginPath();
    ctx.moveTo(6, -140);
    ctx.quadraticCurveTo(
      6 + Math.cos(a) * len * 0.6, -140 + Math.sin(a) * len * 0.55 - 14,
      6 + Math.cos(a) * len, -140 + Math.sin(a) * len + 18,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function water(ctx, w, y, h, rnd, sunX, sunColor) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#1b0f3a');
  g.addColorStop(1, '#05030f');
  ctx.fillStyle = g;
  ctx.fillRect(0, y, w, h);
  // sun reflection streak
  for (let i = 0; i < 46; i++) {
    const yy = y + 8 + rnd() * (h - 16);
    const ww = 26 + rnd() * 120;
    ctx.fillStyle = sunColor;
    ctx.globalAlpha = 0.10 + rnd() * 0.30;
    ctx.fillRect(sunX - ww / 2 + (rnd() - 0.5) * 60, yy, ww, 3 + rnd() * 3);
  }
  ctx.globalAlpha = 1;
}

function neonSign(ctx, x, y, text, color, size) {
  ctx.save();
  ctx.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.shadowColor = color;
  ctx.shadowBlur = 26;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 6;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function road(ctx, w, y, h, rnd) {
  ctx.fillStyle = '#0d0716';
  ctx.fillRect(0, y, w, h);
  ctx.strokeStyle = 'rgba(255,214,120,0.75)';
  ctx.lineWidth = 4;
  ctx.setLineDash([34, 30]);
  ctx.beginPath();
  ctx.moveTo(0, y + h * 0.52);
  ctx.lineTo(w, y + h * 0.52);
  ctx.stroke();
  ctx.setLineDash([]);
  // car light streaks
  for (let i = 0; i < 8; i++) {
    const yy = y + 12 + rnd() * (h - 30);
    ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,60,90,0.8)' : 'rgba(255,240,180,0.8)';
    ctx.fillRect(rnd() * w, yy, 60 + rnd() * 130, 4);
  }
  // one parked low-rider silhouette with headlight beams
  const cx = w * 0.62;
  const cy = y + h * 0.62;
  ctx.fillStyle = '#05030c';
  ctx.beginPath();
  ctx.moveTo(cx - 150, cy);
  ctx.lineTo(cx - 110, cy - 34);
  ctx.lineTo(cx - 40, cy - 44);
  ctx.lineTo(cx + 60, cy - 40);
  ctx.lineTo(cx + 140, cy - 6);
  ctx.lineTo(cx + 150, cy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ff2e88';
  ctx.beginPath();
  ctx.arc(cx - 118, cy - 2, 6, 0, Math.PI * 2);
  ctx.arc(cx + 128, cy - 2, 6, 0, Math.PI * 2);
  ctx.fill();
  const beam = ctx.createLinearGradient(cx + 130, cy - 4, cx + 340, cy - 4);
  beam.addColorStop(0, 'rgba(255,240,180,0.5)');
  beam.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(cx + 130, cy - 8);
  ctx.lineTo(cx + 340, cy - 26);
  ctx.lineTo(cx + 340, cy + 10);
  ctx.lineTo(cx + 130, cy + 2);
  ctx.closePath();
  ctx.fill();
}

export const SAMPLE_SCENES = [
  { id: 'boulevard', name: 'Sunset Boulevard', seed: 11 },
  { id: 'pier', name: 'Neon Pier', seed: 47 },
  { id: 'palms', name: 'Palm Avenue', seed: 83 },
];

export function drawSampleScene(sceneId, width = 1200, height = 900) {
  const scene = SAMPLE_SCENES.find((s) => s.id === sceneId) || SAMPLE_SCENES[0];
  const rnd = mulberry32(scene.seed);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const horizon = height * 0.62;

  if (scene.id === 'boulevard') {
    sky(ctx, width, height, '#2b0a4d', '#c22a7a', '#ff8a3d');
    stars(ctx, width, height, rnd, 60);
    sunDisc(ctx, width * 0.68, height * 0.42, 92, '#ffd76a', 'rgba(255,150,60,0.5)');
    buildings(ctx, width, horizon, rnd, ['#241033', '#1c0b2b', '#2e1440']);
    road(ctx, width, horizon, height - horizon, rnd);
    palm(ctx, width * 0.08, horizon + 6, 1.15, -0.06, '#12081f');
    palm(ctx, width * 0.94, horizon + 4, 1.3, 0.08, '#12081f');
    neonSign(ctx, width * 0.5, height * 0.30, 'BOULEVARD', '#22e6ff', 40);
  } else if (scene.id === 'pier') {
    sky(ctx, width, height, '#0a0626', '#5b1a6e', '#ff2e88');
    stars(ctx, width, height, rnd, 90);
    sunDisc(ctx, width * 0.3, height * 0.5, 70, '#ff9ecf', 'rgba(255,46,136,0.45)');
    buildings(ctx, width, horizon, rnd, ['#160a30', '#100822', '#1e0e38']);
    water(ctx, width, horizon, height - horizon, rnd, width * 0.3, 'rgba(255,110,190,0.9)');
    // pier deck
    ctx.fillStyle = '#120a24';
    ctx.fillRect(0, horizon - 6, width, 14);
    for (let i = 0; i < 6; i++) {
      const px = 60 + i * 200 + rnd() * 30;
      ctx.fillStyle = '#1d1038';
      ctx.fillRect(px, horizon - 60, 10, 66);
      ctx.fillStyle = i % 2 ? '#22e6ff' : '#ff2e88';
      ctx.beginPath();
      ctx.arc(px + 5, horizon - 66, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    neonSign(ctx, width * 0.5, height * 0.30, 'NEON PIER', '#ff2e88', 40);
    palm(ctx, width * 0.88, horizon - 4, 1.05, 0.05, '#0a0518');
  } else {
    sky(ctx, width, height, '#3a1160', '#e85d8a', '#ffc46b');
    stars(ctx, width, height, rnd, 40);
    sunDisc(ctx, width * 0.5, height * 0.46, 84, '#ffe9a8', 'rgba(255,180,90,0.5)');
    buildings(ctx, width, horizon, rnd, ['#2a1240', '#1e0d33', '#33164a']);
    road(ctx, width, horizon, height - horizon, rnd);
    for (let i = 0; i < 5; i++) {
      palm(ctx, width * (0.06 + i * 0.2), horizon + 8, 1.0 + rnd() * 0.35, (rnd() - 0.5) * 0.16, '#160a26');
    }
    neonSign(ctx, width * 0.5, height * 0.30, 'PALM AVENUE', '#ffb02e', 40);
  }
  return canvas;
}

export function samplePhoto(sceneId) {
  const canvas = drawSampleScene(sceneId);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = canvas.toDataURL('image/png');
  });
}
