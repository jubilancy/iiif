import { useEffect, useRef, useState } from 'react';
import Mirador from 'mirador';
import 'mirador-annotation-editor/dist/index.css';
import { buildPlugins, annotationAdapters } from '../plugins.js';

export default function Viewer({ manifests, theme, embed = false, disable = [], enable = [] }) {
  const holder = useRef(null);
  const [error, setError] = useState('');
  const key = `${manifests.join('\n')}|${disable.join(',')}|${enable.join(',')}`;

  useEffect(() => {
    const el = holder.current;
    const mount = document.createElement('div');
    mount.id = 'mirador';
    mount.style.cssText = 'width:100%;height:100%';
    el.appendChild(mount);
    let viewer;
    try {
      const { LocalStorageAdapter } = annotationAdapters;
      viewer = Mirador.viewer({
        id: 'mirador',
        selectedTheme: theme,
        windows: manifests.map((manifestId) => ({ manifestId })),
        window: { sideBarOpenByDefault: false, imageToolsEnabled: true },
        workspaceControlPanel: { enabled: !embed },
        workspace: { isWorkspaceAddVisible: !embed },
        annotation: {
          adapter: (canvasId) => new LocalStorageAdapter(`localStorage://?canvasId=${canvasId}`, 'Anonymous'),
          exportLocalStorageAnnotations: true,
          readonly: embed,
        },
        textOverlay: { enabled: true, selectable: true, visible: false },
      }, buildPlugins({ embed, disable, enable }));
      setError('');
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
    }
    return () => {
      try { viewer?.unmount(); } catch (e) { console.warn(e); }
      mount.remove();
    };
    // Remount when the manifest list or theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, theme, embed]);

  return (
    <div className="viewer-wrap">
      {error && <p className="error">Viewer failed to start: {error}</p>}
      <div ref={holder} className="viewer-holder" />
    </div>
  );
}
