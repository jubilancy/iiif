// Replaces Mirador's logo with the glosse.me mark (a `wrap` plugin on the `Branding` target).
export const brandingPlugin = {
  target: 'Branding',
  mode: 'wrap',
  component: () => (
    <a href="/" style={{ color: 'inherit', fontWeight: 700, fontSize: 12, textDecoration: 'none', padding: 8, textAlign: 'center' }} title="iiif.glosse.me home">
      IIIF
    </a>
  ),
};
