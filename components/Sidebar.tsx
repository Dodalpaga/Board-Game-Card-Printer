'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Upload,
  Link2,
  Printer,
  ChevronLeft,
  ChevronRight,
  Layers,
  Github,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.FC<{ className?: string }>;
  href: string;
  badge?: number | null;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    images: number;
    cards: number;
    totalCards: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'upload',
      label: 'Images',
      sublabel: 'Rectos & Versos',
      icon: Upload,
      href: '#',
      badge: counts.images || null,
    },
    {
      id: 'associate',
      label: 'Associations',
      sublabel: 'Créer des cartes',
      icon: Link2,
      href: '#',
      badge: counts.cards || null,
    },
    {
      id: 'layout',
      label: 'Impression',
      sublabel: 'Mise en page A4',
      icon: Printer,
      href: '#',
      badge: counts.totalCards || null,
    },
  ];

  return (
    <aside
      className="sidebar no-print"
      style={{
        width: collapsed ? '72px' : 'var(--sidebar-w)',
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
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '20px 0' : '20px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '72px',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background:
              'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(0,212,255,0.4)',
          }}
        >
          <Layers size={18} color="#070b14" strokeWidth={2.5} />
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

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: '16px 0',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Section label */}
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

        {navItems.map((item, index) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: collapsed ? '10px 0' : '10px 20px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 100%)'
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
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background =
                    'rgba(255,255,255,0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background =
                    'transparent';
                }
              }}
            >
              {/* Step number dot */}
              {!collapsed && (
                <div
                  style={{
                    position: 'absolute',
                    left: 20,
                    width: 20,
                    height: 20,
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
                className=""
                style={{
                  width: 18,
                  height: 18,
                  color: isActive
                    ? 'var(--accent-cyan)'
                    : 'var(--text-secondary)',
                  flexShrink: 0,
                  marginLeft: collapsed ? 0 : 30,
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

              {!collapsed &&
                item.badge !== null &&
                item.badge !== undefined && (
                  <div
                    style={{
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: isActive
                        ? 'rgba(0,212,255,0.15)'
                        : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isActive ? 'rgba(0,212,255,0.3)' : 'var(--border-subtle)'}`,
                      fontSize: 11,
                      fontWeight: 700,
                      color: isActive
                        ? 'var(--accent-cyan)'
                        : 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                      flexShrink: 0,
                    }}
                  >
                    {item.badge}
                  </div>
                )}
            </button>
          );
        })}

        {/* Separator */}
        <div
          style={{
            margin: '16px 20px',
            height: 1,
            background: 'var(--border-subtle)',
          }}
        />

        {/* Home link */}
        <Link
          href="/"
          title={collapsed ? 'Accueil' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? '10px 0' : '10px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color 0.15s',
            fontSize: 13,
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
          }
        >
          <LayoutGrid size={16} style={{ flexShrink: 0 }} />
          {!collapsed && (
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
              }}
            >
              Accueil
            </span>
          )}
        </Link>
      </nav>

      {/* Footer */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '12px 0',
        }}
      >
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
          <Github size={15} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Open Source</span>}
        </a>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '8px 0' : '8px 20px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--text-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
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
          {collapsed ? (
            <ChevronRight size={15} />
          ) : (
            <>
              <ChevronLeft size={15} style={{ flexShrink: 0 }} />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
