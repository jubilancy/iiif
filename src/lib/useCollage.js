import { useEffect, useState } from 'react';
import { getCollage, subscribe } from './collageStore.js';

export function useCollage() {
  const [items, setItems] = useState(getCollage());
  useEffect(() => subscribe(setItems), []);
  return items;
}
