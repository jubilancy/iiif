import { createElement, Fragment } from 'react';

// Manifest values may contain HTML. Parse it and rebuild only a small safe subset as React
// elements (no dangerouslySetInnerHTML): links are limited to http(s), everything else is text.
const KEEP = new Set(['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'sub', 'sup', 'span']);

function build(node, key) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return null;
  const tag = node.tagName.toLowerCase();
  if (tag === 'script' || tag === 'style') return null;
  const kids = [...node.childNodes].map((n, i) => build(n, i));
  if (tag === 'br') return createElement('br', { key });
  if (tag === 'a') {
    const href = node.getAttribute('href') || '';
    return /^https?:\/\//i.test(href)
      ? createElement('a', { key, href, target: '_blank', rel: 'noopener noreferrer' }, kids)
      : createElement(Fragment, { key }, kids);
  }
  return KEEP.has(tag) ? createElement(tag, { key }, kids) : createElement(Fragment, { key }, kids);
}

export default function RichText({ html }) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  return <>{[...doc.body.firstChild.childNodes].map((n, i) => build(n, i))}</>;
}
