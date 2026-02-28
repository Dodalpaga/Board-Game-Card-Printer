// components/ThemeToggle.tsx
'use client';
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import type { Theme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
  collapsed?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  collapsed = false,
}) => {
  const isDark = theme === 'dark';

  if (collapsed) {
    /* Compact icon-only version for collapsed sidebar */
    return (
      <button
        onClick={onToggle}
        title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.color =
            'var(--text-secondary)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
        }
      >
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    );
  }

  /* Expanded: label + animated pill toggle */
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
      }}
    >
      {/* Label + icon */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--text-muted)',
          fontSize: 12,
          fontFamily: 'var(--font-body)',
        }}
      >
        {isDark ? (
          <Moon size={13} style={{ flexShrink: 0 }} />
        ) : (
          <Sun size={13} style={{ flexShrink: 0 }} />
        )}
        <span>{isDark ? 'Mode sombre' : 'Mode clair'}</span>
      </div>

      {/* Pill toggle */}
      <button
        onClick={onToggle}
        aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        style={{
          position: 'relative',
          width: 40,
          height: 22,
          borderRadius: 99,
          background: isDark ? 'var(--bg-elevated)' : 'rgba(0,212,255,0.15)',
          border: `1px solid ${isDark ? 'var(--border-default)' : 'rgba(0,212,255,0.35)'}`,
          cursor: 'pointer',
          transition: 'background 0.3s ease, border-color 0.3s ease',
          flexShrink: 0,
          outline: 'none',
          padding: 0,
        }}
        onFocus={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 0 0 3px rgba(0,212,255,0.25)';
        }}
        onBlur={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: isDark ? 'var(--text-muted)' : 'var(--accent-cyan)',
            transform: isDark ? 'translateX(0)' : 'translateX(18px)',
            transition:
              'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease',
            display: 'block',
            boxShadow: isDark ? 'none' : '0 0 6px rgba(0,212,255,0.6)',
          }}
        />
      </button>
    </div>
  );
};
