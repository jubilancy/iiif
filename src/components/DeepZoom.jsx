import { useEffect, useRef, useState } from 'react';
import OpenSeadragon from 'openseadragon';

// Deep zoom straight from the source's IIIF Image API (info.json), via OpenSeadragon.
// If the image server blocks cross-origin tile requests, fall back to a plain <img>.
export default function DeepZoom({ canvas }) {
  const el = useRef(null);
  const osd = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    if (!canvas) return undefined;
    const tileSource = canvas.service
      ? `${canvas.service.base}/info.json`
      : { type: 'image', url: canvas.image };
    const viewer = OpenSeadragon({
      element: el.current,
      tileSources: tileSource,
      showNavigationControl: false,
      crossOriginPolicy: 'Anonymous',
      gestureSettingsMouse: { clickToZoom: false },
      maxZoomPixelRatio: 2,
      visibilityRatio: 0.8,
    });
    viewer.addHandler('open-failed', () => setFailed(true));
    osd.current = viewer;
    return () => { viewer.destroy(); osd.current = null; };
  }, [canvas]);

  if (!canvas) return <p className="muted">This manifest has no images.</p>;
  if (failed) {
    const src = canvas.service ? `${canvas.service.base}/full/!1400,1400/0/default.jpg` : canvas.image;
    return (
      <div className="dz-fallback">
        <img src={src} alt={canvas.label} />
        <p className="muted small">Deep zoom is unavailable for this image (the image server did not allow it), so a fixed-size image is shown.</p>
      </div>
    );
  }
  const call = (fn) => () => { const v = osd.current; if (v) fn(v); };
  return (
    <div className="dz">
      <div ref={el} className="dz-canvas" aria-label={`Zoomable image: ${canvas.label}`} />
      <div className="dz-tools" role="group" aria-label="Zoom controls">
        <button className="ghost" onClick={call((v) => v.viewport.zoomBy(1.6))} aria-label="Zoom in">+</button>
        <button className="ghost" onClick={call((v) => v.viewport.zoomBy(1 / 1.6))} aria-label="Zoom out">−</button>
        <button className="ghost" onClick={call((v) => v.viewport.goHome())} aria-label="Reset view">⟲</button>
        <button className="ghost" onClick={call((v) => v.setFullScreen(true))} aria-label="Full screen">⛶</button>
      </div>
    </div>
  );
}
