// Collage list kept in localStorage (best-effort; works without it).
const KEY = 'iiif.collage.v1';
const listeners = new Set();
let memory = [];

function read() {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) || 'null');
    return Array.isArray(v) ? v : memory;
  } catch { return memory; }
}

export function getCollage() { return read(); }

export function setCollage(items) {
  memory = items;
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  listeners.forEach((l) => l(items));
}

export function addToCollage(entries) {
  const cur = read();
  const have = new Set(cur.map((c) => c.url));
  const add = entries.filter((e) => e.url && !have.has(e.url));
  setCollage([...cur, ...add]);
  return add.length;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
