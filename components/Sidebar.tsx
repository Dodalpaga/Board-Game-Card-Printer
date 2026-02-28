// components/Sidebar.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  Link2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Layers,
  Github,
  LayoutGrid,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Theme } from '@/hooks/useTheme';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    images: number;
    cards: number;
    totalCards: number;
  };
  theme: Theme;
  onThemeToggle: () => void;
}

const NAV_ITEMS = [
  {
    id: 'upload',
    label: 'Images',
    sublabel: 'Rectos & Versos',
    icon: Upload,
    badgeKey: 'images',
  },
  {
    id: 'associate',
    label: 'Associations',
    sublabel: 'Créer des cartes',
    icon: Link2,
    badgeKey: 'cards',
  },
  {
    id: 'layout',
    label: 'Impression',
    sublabel: 'Mise en page A4',
    icon: Printer,
    badgeKey: 'totalCards',
  },
] as const;

type BadgeKey = (typeof NAV_ITEMS)[number]['badgeKey'];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
  theme,
  onThemeToggle,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="no-print"
      style={{
        width: collapsed ? '68px' : 'var(--sidebar-w)',
        minHeight: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 68,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background:
              'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 14px rgba(0,212,255,0.35)',
          }}
        >
          <Layers size={16} color="#070b14" strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 15,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.02em',
              }}
            >
              CardPrinter
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: 1,
              }}
            >
              Print & Play
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: '0 20px 8px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Workflow
          </div>
        )}

        {NAV_ITEMS.map((item, index) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const badge = counts[item.badgeKey as BadgeKey];

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: collapsed ? '10px 0' : '10px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.11) 0%, rgba(0,212,255,0.03) 100%)'
                  : 'transparent',
                borderLeft: isActive
                  ? '2px solid var(--accent-cyan)'
                  : '2px solid transparent',
                borderRight: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: 2,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    'var(--glass-bg)';
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.background =
                    'transparent';
              }}
            >
              {/* Step number */}
              {!collapsed && (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: isActive
                      ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))'
                      : 'var(--bg-elevated)',
                    border: isActive
                      ? 'none'
                      : '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    color: isActive ? '#070b14' : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                    boxShadow: isActive
                      ? '0 0 8px rgba(0,212,255,0.4)'
                      : 'none',
                  }}
                >
                  {index + 1}
                </div>
              )}

              <Icon
                size={17}
                style={{
                  color: isActive
                    ? 'var(--accent-cyan)'
                    : 'var(--text-secondary)',
                  flexShrink: 0,
                  transition: 'color 0.15s',
                }}
              />

              {!collapsed && (
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      marginTop: 1,
                    }}
                  >
                    {item.sublabel}
                  </div>
                </div>
              )}

              {!collapsed && badge > 0 && (
                <div
                  style={{
                    padding: '2px 7px',
                    borderRadius: 99,
                    background: isActive
                      ? 'rgba(0,212,255,0.14)'
                      : 'var(--glass-bg)',
                    border: `1px solid ${isActive ? 'rgba(0,212,255,0.28)' : 'var(--border-subtle)'}`,
                    fontSize: 10,
                    fontWeight: 700,
                    color: isActive
                      ? 'var(--accent-cyan)'
                      : 'var(--text-muted)',
                    fontFamily: 'var(--font-display)',
                    flexShrink: 0,
                  }}
                >
                  {badge}
                </div>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div
          style={{
            margin: '14px 20px',
            height: 1,
            background: 'var(--border-subtle)',
          }}
        />

        {/* Home */}
        <Link
          href="/"
          title={collapsed ? 'Accueil' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '8px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: 12,
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
          <LayoutGrid size={14} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span
              style={{ fontFamily: 'var(--font-display)', fontWeight: 500 }}
            >
              Accueil
            </span>
          )}
        </Link>
      </nav>

      {/* ── Footer (theme + github + collapse) ── */}
      <div
        style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 4 }}
      >
        {/* Theme toggle */}
        <ThemeToggle
          theme={theme}
          onToggle={onThemeToggle}
          collapsed={collapsed}
        />

        {/* GitHub */}
        <a
          href="https://github.com/dodalpaga/Board-Game-Card-Printer"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'GitHub' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '8px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: 12,
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
          <Github size={13} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Open Source</span>}
        </a>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Agrandir' : 'Réduire'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0 12px' : '8px 20px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            transition: 'color 0.15s',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
          }
        >
          {collapsed ? (
            <ChevronRight size={14} />
          ) : (
            <>
              <ChevronLeft size={14} style={{ flexShrink: 0 }} />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
