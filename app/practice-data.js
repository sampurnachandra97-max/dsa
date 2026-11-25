'use client';

import { useEffect, useRef, useState } from 'react';

const storageKey = 'algolab-progress';
const empty = { drafts: {}, programs: {}, saved: [], solved: [] };

function read(fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (stored) return { ...empty, ...stored };
  } catch {}
  return fallback;
}

export function usePracticeData() {
  const [data, setData] = useState(empty);
  const current = useRef(empty);
  useEffect(() => {
    function refresh() {
      current.current = read(empty);
      setData(current.current);
    }
    refresh();
    const sync = event => {
      if (event.key === storageKey || event.key === null) refresh();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  function update(change) {
    current.current = change(read(current.current));
    setData(current.current);
    try { localStorage.setItem(storageKey, JSON.stringify(current.current)); } catch {}
  }

  function toggle(id) {
    update(prev => ({ ...prev, saved: prev.saved.includes(id) ? prev.saved.filter(saved => saved !== id) : [...prev.saved, id] }));
  }

  return { data, update, toggle };
}
