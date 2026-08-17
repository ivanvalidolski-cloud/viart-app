'use client';

import { useEffect, useState } from 'react';

const QUERY = '(hover: hover) and (pointer: fine)';

/**
 * True only on a device that has a real pointer to hover with.
 *
 * The magnet and the lens are both pointer-driven embellishments: on a
 * touchscreen the magnet has nothing to follow and the lens fights the scroll,
 * so both are switched off rather than shipped in a degraded state.
 *
 * Starts `false` so the server and the first client paint agree, then settles
 * after mount — the components it gates only add behaviour, never layout.
 */
export function usePointerFine() {
  const [pointerFine, setPointerFine] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const sync = () => setPointerFine(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return pointerFine;
}
