function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed'));
    img.src = src;
  });
}

// Draws a grid collage of item thumbnails. Items whose image cannot be loaded
// (network, CORS) get a labelled placeholder so one failure never blocks the export.
export async function renderCollagePng(items, { cell = 320, label = true } = {}) {
  const cols = Math.max(1, Math.ceil(Math.sqrt(items.length)));
  const rows = Math.ceil(items.length / cols);
  const canvas = document.createElement('canvas');
  canvas.width = cols * cell;
  canvas.height = rows * cell;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const failed = [];
  await Promise.all(items.map(async (it, i) => {
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    try {
      if (!it.thumbnail) throw new Error('no thumbnail');
      const img = await loadImage(it.thumbnail);
      const s = Math.max(cell / img.width, cell / img.height);
      const w = img.width * s;
      const h = img.height * s;
      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, cell, cell); ctx.clip();
      ctx.drawImage(img, x + (cell - w) / 2, y + (cell - h) / 2, w, h);
      ctx.restore();
    } catch {
      failed.push(it.title || it.url);
      ctx.fillStyle = '#333'; ctx.fillRect(x, y, cell, cell);
      ctx.fillStyle = '#ccc'; ctx.font = '14px sans-serif';
      ctx.fillText('Image unavailable', x + 12, y + cell / 2);
    }
    if (label) {
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x, y + cell - 26, cell, 26);
      ctx.fillStyle = '#fff'; ctx.font = '13px sans-serif';
      ctx.fillText((it.title || '').slice(0, 44), x + 8, y + cell - 9);
    }
  }));
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  return { blob, failed };
}

export function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
