// hooks/useTheme.ts
'use client';
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'cardprinter-theme';

/**
 * All CSS custom-property values for the LIGHT theme.
 * These are applied directly as inline style.setProperty() calls on the
 * app wrapper element — no CSS cascade magic needed, 100% reliable.
 * When switching back to dark, we removeProperty() them all and the
 * :root defaults take over automatically.
 */
export const LIGHT_VARS: Record<string, string> = {
  /* surfaces */
  '--bg-base': '#e8e3db',
  '--bg-surface': '#ede8e0',
  '--bg-elevated': '#f4f0e8',
  '--bg-card': '#ffffff',
  '--bg-card-hover': '#faf8f5',
  /* borders */
  '--border-subtle': 'rgba(0,0,0,0.05)',
  '--border-default': 'rgba(0,0,0,0.09)',
  '--border-strong': 'rgba(0,0,0,0.16)',
  /* text */
  '--text-primary': '#111827',
  '--text-secondary': '#4b5563',
  '--text-muted': '#9ca3af',
  /* status tokens */
  '--c-info-bg': '#eff6ff',
  '--c-info-border': '#bfdbfe',
  '--c-info-text': '#1d4ed8',
  '--c-success-bg': '#f0fdf4',
  '--c-success-border': '#bbf7d0',
  '--c-success-text': '#15803d',
  '--c-danger-bg': '#fef2f2',
  '--c-danger-border': '#fecaca',
  '--c-danger-text': '#dc2626',
  '--c-indigo-bg': '#eef2ff',
  '--c-indigo-text': '#4338ca',
  /* paper — A4 preview sheet */
  '--c-paper': '#ffffff',
  '--c-paper-border': 'rgba(0,0,0,0.10)',
  '--c-paper-guide': 'rgba(0,0,0,0.22)',
  '--c-paper-card': 'rgba(0,0,0,0.12)',
  /* shadows */
  '--shadow-sm': '0 1px 3px rgba(0,0,0,0.08)',
  '--shadow-md': '0 4px 16px rgba(0,0,0,0.10)',
  '--shadow-card':
    '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
  /* glass */
  '--glass-bg': 'rgba(0,0,0,0.03)',
  '--glass-bg-strong': 'rgba(0,0,0,0.05)',
  /* scrollbar */
  '--scrollbar-thumb': 'rgba(0,0,0,0.12)',
  '--scrollbar-hover': 'rgba(0,0,0,0.22)',
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  // Read persisted preference on first mount only
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
