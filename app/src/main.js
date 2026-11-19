// Neon Shores editor wiring: owns the cover state, binds every control,
// loads photos (uploads or procedural samples), and drives the renderer.
// The ?shot= query drives screenshot mode: ?shot=cover renders a full-bleed
// cover, ?shot=editor shows the editor with a photo loaded.
import { drawCover, exportCoverPNG, panelAt, SIZES } from './render.js';
import { samplePhoto, SAMPLE_SCENES } from './samples.js';

const $ = (id) => document.getElementById(id);

const canvas = $('cover');
const state = {
  photos: [null, null, null, null],
  pans: [
    { zoom: 1.2, panX: 0, panY: 0 },
    { zoom: 1.2, panX: 0, panY: 0 },
    { zoom: 1.2, panX: 0, panY: 0 },
    { zoom: 1.2, panX: 0, panY: 0 },
  ],
  title: 'NEON SHORES',
  subtitle: 'A Vice City nights story',
  kicker: 'WELCOME TO THE SHORE',
  grade: 'neon',
  layout: 'nights',
  size: '1080x1080',
  glow: 70,
  grain: 45,
  selected: 0,
};

let renderQueued = false;
function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    try {
      const { w, h } = drawCover(canvas, state);
      const size = SIZES[state.size];
      $('sizeLabel').textContent = size.label;
      $('renderState').textContent = `Rendered ${w} × ${h}`;
      window.__coverReady = true;
    } catch (err) {
      $('renderState').textContent = `Render error: ${err.message}`;
      window.__coverError = String(err);
    }
  });
}

function syncPanelControls() {
  const pan = state.pans[state.selected];
  $('panelSelect').value = String(state.selected);
  $('zoomSlider').value = String(Math.round(pan.zoom * 100));
  $('zoomOut').textContent = `${pan.zoom.toFixed(2)}×`;
  $('panXSlider').value = String(pan.panX);
  $('panXOut').textContent = String(pan.panX);
  $('panYSlider').value = String(pan.panY);
  $('panYOut').textContent = String(pan.panY);
}

function setStatus(msg) {
  $('status').textContent = msg;
}

async function loadSamples() {
  setStatus('Painting sample scenes…');
  try {
    const imgs = await Promise.all(SAMPLE_SCENES.map((s) => samplePhoto(s.id)));
    state.photos = [imgs[0], imgs[1], imgs[2], imgs[0]];
    setStatus(`Loaded ${imgs.length} sample scenes — drag a panel to reposition its photo.`);
    render();
  } catch (err) {
    setStatus(`Sample scenes failed: ${err.message}`);
  }
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file'));
    };
    img.src = url;
  });
}

async function downloadPNG(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function bindControls() {
  $('sampleBtn').addEventListener('click', loadSamples);

  $('photoInput').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const img = await fileToImage(file);
      state.photos[state.selected] = img;
      setStatus(`Photo loaded into panel ${state.selected + 1}.`);
      render();
    } catch (err) {
      setStatus(err.message);
    }
    ev.target.value = '';
  });

  $('fillAllBtn').addEventListener('click', () => {
    const first = state.photos.find((p) => p);
    if (!first) {
      setStatus('Load a photo first, then use one photo everywhere.');
      return;
    }
    state.photos = [first, first, first, first];
    setStatus('One photo now fills every panel.');
    render();
  });

  $('clearBtn').addEventListener('click', () => {
    state.photos = [null, null, null, null];
    setStatus('Photos cleared.');
    render();
  });

  $('panelSelect').addEventListener('change', (ev) => {
    state.selected = Number(ev.target.value);
    syncPanelControls();
    render();
  });

  $('zoomSlider').addEventListener('input', (ev) => {
    state.pans[state.selected].zoom = Number(ev.target.value) / 100;
    $('zoomOut').textContent = `${state.pans[state.selected].zoom.toFixed(2)}×`;
    render();
  });
  $('panXSlider').addEventListener('input', (ev) => {
    state.pans[state.selected].panX = Number(ev.target.value);
    $('panXOut').textContent = ev.target.value;
    render();
  });
  $('panYSlider').addEventListener('input', (ev) => {
    state.pans[state.selected].panY = Number(ev.target.value);
    $('panYOut').textContent = ev.target.value;
    render();
  });

  $('titleInput').addEventListener('input', (ev) => {
    state.title = ev.target.value;
    render();
  });
  $('subtitleInput').addEventListener('input', (ev) => {
    state.subtitle = ev.target.value;
    render();
  });
  $('kickerInput').addEventListener('input', (ev) => {
    state.kicker = ev.target.value;
    render();
  });
  $('gradeSelect').addEventListener('change', (ev) => {
    state.grade = ev.target.value;
    render();
  });
  $('layoutSelect').addEventListener('change', (ev) => {
    state.layout = ev.target.value;
    render();
  });
  $('sizeSelect').addEventListener('change', (ev) => {
    state.size = ev.target.value;
    render();
  });
  $('glowSlider').addEventListener('input', (ev) => {
    state.glow = Number(ev.target.value);
    $('glowOut').textContent = ev.target.value;
    render();
  });
  $('grainSlider').addEventListener('input', (ev) => {
    state.grain = Number(ev.target.value);
    $('grainOut').textContent = ev.target.value;
    render();
  });

  $('exportBtn').addEventListener('click', async () => {
    setStatus('Exporting PNG…');
    try {
      const blob = await exportCoverPNG(state);
      const stamp = state.size.replace('x', '-');
      await downloadPNG(blob, `neon-shores-cover-${stamp}.png`);
      setStatus(`Exported ${state.size} PNG (${Math.round(blob.size / 1024)} KiB).`);
      window.__exported = true;
    } catch (err) {
      setStatus(`Export failed: ${err.message}`);
    }
  });

  // drag to pan the selected panel, wheel to zoom it, click to select a panel
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener('pointerdown', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const px = ((ev.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((ev.clientY - rect.top) / rect.height) * canvas.height;
    state.selected = panelAt(state.layout, px, py, canvas.width, canvas.height);
    syncPanelControls();
    dragging = true;
    lastX = ev.clientX;
    lastY = ev.clientY;
    canvas.setPointerCapture(ev.pointerId);
    render();
  });
  canvas.addEventListener('pointermove', (ev) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const pan = state.pans[state.selected];
    pan.panX += ((ev.clientX - lastX) / rect.width) * 120;
    pan.panY += ((ev.clientY - lastY) / rect.height) * 120;
    pan.panX = Math.max(-50, Math.min(50, pan.panX));
    pan.panY = Math.max(-50, Math.min(50, pan.panY));
    lastX = ev.clientX;
    lastY = ev.clientY;
    syncPanelControls();
    render();
  });
  canvas.addEventListener('pointerup', () => {
    dragging = false;
  });
  canvas.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const pan = state.pans[state.selected];
    pan.zoom = Math.max(1, Math.min(2.6, pan.zoom - Math.sign(ev.deltaY) * 0.08));
    syncPanelControls();
    render();
  }, { passive: false });
}

async function applyShotQuery() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return;
  const caption = q.get('caption');
  if (caption) {
    state.title = caption.toUpperCase();
    $('titleInput').value = state.title;
  }
  const grade = q.get('grade');
  if (grade) {
    state.grade = grade;
    $('gradeSelect').value = grade;
  }
  const layout = q.get('layout');
  if (layout) {
    state.layout = layout;
    $('layoutSelect').value = layout;
  }
  const size = q.get('size');
  if (size && SIZES[size]) {
    state.size = size;
    $('sizeSelect').value = size;
  }
  await loadSamples();
  if (shot === 'cover') {
    document.body.classList.add('shot-cover');
  }
  render();
}

bindControls();
syncPanelControls();
applyShotQuery().then(render);

// Test hook: lets automated checks drive the editor state and verify the
// renderer without touching the DOM. Harmless in normal use.
window.__neonShores = { state, render, drawCover, exportCoverPNG };
