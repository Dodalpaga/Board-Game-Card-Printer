'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  Link2,
  Printer,
  Layers,
  ChevronDown,
  Zap,
  Shield,
  Package,
  Github,
  Star,
  FileDown,
  MousePointer,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme, LIGHT_VARS } from '@/hooks/useTheme';

/* ─── Animated counter ───────────────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const duration = 1800;
          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
            else setCount(end);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ─── Feature card ───────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
  delay,
}: {
  icon: React.FC<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  accent: string;
  delay: string;
}) {
  return (
    <div
      className={`animate-fade-up ${delay}`}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        padding: '28px',
        transition: 'all 0.3s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = accent + '44';
        el.style.transform = 'translateY(-4px)';
        el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = 'var(--border-default)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      {/* Corner gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at top right, ${accent}10 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Icon size={22} style={{ color: accent }} />
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 10,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ─── Step card ──────────────────────────────── */
function StepCard({
  number,
  icon: Icon,
  title,
  description,
  delay,
}: {
  number: string;
  icon: React.FC<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div
      className={`animate-fade-up ${delay}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '32px 24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background:
            'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(91,106,249,0.15) 100%)',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background:
              'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 800,
            color: '#070b14',
            fontFamily: 'var(--font-display)',
          }}
        >
          {number}
        </span>
        <Icon size={26} style={{ color: 'var(--accent-cyan)' }} />
      </div>
      <h3
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 10,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

/* ─── Main Landing Page ──────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle: toggleTheme } = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Apply / remove light-theme CSS vars directly on the root div —
     same technique as the app page, keeps the landing always self-contained */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (theme === 'light') {
      Object.entries(LIGHT_VARS).forEach(([prop, val]) =>
        el.style.setProperty(prop, val),
      );
    } else {
      Object.keys(LIGHT_VARS).forEach((prop) => el.style.removeProperty(prop));
    }
  }, [theme]);

  return (
    <div
      ref={wrapperRef}
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        fontFamily: 'var(--font-body)',
        overflowX: 'hidden',
        transition: 'background 0.3s ease',
      }}
    >
      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 40px',
          height: 68,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'var(--bg-surface)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--border-subtle)'
            : '1px solid transparent',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
              boxShadow: '0 0 14px rgba(0,212,255,0.4)',
            }}
          >
            <Layers size={16} color="#070b14" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 16,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            CardPrinter
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <a
            href="https://github.com/dodalpaga/Board-Game-Card-Printer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 500,
              transition: 'color 0.2s',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                'var(--text-primary)')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                'var(--text-secondary)')
            }
          >
            <Github size={14} />
            GitHub
          </a>

          {/* ── Theme toggle ── */}
          <button
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? 'Passer en mode clair'
                : 'Passer en mode sombre'
            }
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: 9,
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--glass-bg-strong)';
              el.style.borderColor = 'var(--border-strong)';
              el.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'var(--glass-bg)';
              el.style.borderColor = 'var(--border-default)';
              el.style.color = 'var(--text-secondary)';
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/app"
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            Lancer l&apos;outil
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="bg-grid bg-noise"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '120px 24px 80px',
          position: 'relative',
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,255,0.14) 0%, transparent 65%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(91,106,249,0.1) 0%, transparent 60%), var(--bg-base)',
          textAlign: 'center',
        }}
      >
        {/* Decorative orbs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            right: '8%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(91,106,249,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        {/* Badge */}
        <div className="animate-fade-in" style={{ marginBottom: 28 }}>
          <span className="badge-cyan">
            <span className="glow-dot" style={{ width: 5, height: 5 }} />
            Print & Play · Open Source
          </span>
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-up delay-100"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 7vw, 88px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
            maxWidth: 900,
            marginBottom: 28,
            color: 'var(--text-primary)',
          }}
        >
          Imprimez vos <span className="text-gradient">cartes de jeu</span>
          <br />
          comme un pro.
        </h1>

        {/* Subline */}
        <p
          className="animate-fade-up delay-200"
          style={{
            fontSize: 'clamp(15px, 2vw, 19px)',
            color: 'var(--text-secondary)',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: 44,
          }}
        >
          Chargez vos rectos et versos, associez-les, configurez la mise en page
          et exportez un PDF A4 prêt à l&apos;impression — en quelques secondes.
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fade-up delay-300"
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 70,
          }}
        >
          <Link href="/app" className="btn-primary">
            Commencer gratuitement
            <ArrowRight size={15} />
          </Link>
          <a
            href="https://github.com/dodalpaga/Board-Game-Card-Printer"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Github size={15} />
            Voir le code
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in delay-800"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            color: 'var(--text-muted)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}
        >
          <span>Découvrir</span>
          <ChevronDown
            size={16}
            style={{ animation: 'float 2s ease-in-out infinite' }}
          />
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section
        style={{
          padding: '0 24px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
          }}
        >
          {[
            { value: 100, suffix: '%', label: 'Gratuit & open source' },
            { value: 300, suffix: ' DPI', label: "Résolution max d'export" },
            {
              value: 0,
              suffix: ' install',
              label: 'Fonctionne dans le navigateur',
            },
            { value: 3, suffix: ' étapes', label: 'Pour imprimer vos cartes' },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: '28px 24px',
                borderRight: i < 3 ? '1px solid var(--border-subtle)' : 'none',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 32,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  background:
                    'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                <Counter end={stat.value} suffix={stat.suffix} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{ padding: '100px 24px', maxWidth: 1100, margin: '0 auto' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div
            className="badge-cyan animate-fade-up"
            style={{ marginBottom: 16, display: 'inline-flex' }}
          >
            <Zap size={11} />
            Fonctionnalités
          </div>
          <h2
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(30px, 4vw, 48px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}
          >
            Tout ce qu&apos;il vous faut,{' '}
            <span className="text-gradient">rien de plus</span>
          </h2>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              maxWidth: 500,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Un outil focalisé sur une seule chose : transformer vos images en
            cartes imprimables parfaites.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          <FeatureCard
            icon={Upload}
            title="Import massif"
            description="Glissez-déposez des dizaines d'images en une fois. Rectos et versos traités en parallèle avec prévisualisation instantanée."
            accent="#00d4ff"
            delay="delay-100"
          />
          <FeatureCard
            icon={Link2}
            title="Association intelligente"
            description="Sélection multiple avec Shift+Clic, association en masse recto/verso, quantités personnalisables par carte."
            accent="#5b6af9"
            delay="delay-200"
          />
          <FeatureCard
            icon={Printer}
            title="Mise en page A4"
            description="Algorithme de placement optimisé, marges configurables, espacement des cartes, alignement gauche/centre/droite."
            accent="#a855f7"
            delay="delay-300"
          />
          <FeatureCard
            icon={FileDown}
            title="Export PDF haute qualité"
            description="PDF avec pages recto et verso miroir pour l'impression recto-verso automatique. Jusqu'à 300 DPI."
            accent="#10d07a"
            delay="delay-400"
          />
          <FeatureCard
            icon={Package}
            title="Sauvegarde de projet"
            description="Exportez et rechargez vos projets en JSON. Retrouvez votre travail exactement là où vous l'avez laissé."
            accent="#f59e0b"
            delay="delay-500"
          />
          <FeatureCard
            icon={Shield}
            title="100% privé"
            description="Aucune donnée envoyée sur un serveur. Tout se passe dans votre navigateur. Vos images restent sur votre machine."
            accent="#00d4ff"
            delay="delay-600"
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          padding: '80px 24px 100px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div
              className="badge-cyan animate-fade-up"
              style={{ marginBottom: 16, display: 'inline-flex' }}
            >
              <MousePointer size={11} />
              Utilisation
            </div>
            <h2
              className="animate-fade-up delay-100"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              3 étapes pour{' '}
              <span className="text-gradient">imprimer vos cartes</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Connector lines */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '33%',
                right: '33%',
                height: 1,
                background:
                  'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)',
                pointerEvents: 'none',
              }}
            />

            <StepCard
              number="1"
              icon={Upload}
              title="Importez vos images"
              description="Glissez vos rectos (faces avant) et vos versos (faces arrière) dans l'onglet Images."
              delay="delay-100"
            />
            <div
              style={{
                borderLeft: '1px solid var(--border-subtle)',
                borderRight: '1px solid var(--border-subtle)',
              }}
            >
              <StepCard
                number="2"
                icon={Link2}
                title="Créez les associations"
                description="Sélectionnez les rectos, choisissez un verso commun et créez vos cartes en un clic."
                delay="delay-200"
              />
            </div>
            <StepCard
              number="3"
              icon={FileDown}
              title="Exportez en PDF"
              description="Configurez les marges, l'espacement, la résolution puis exportez votre PDF prêt à l'impression."
              delay="delay-300"
            />
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section
        style={{
          padding: '120px 24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className="badge-cyan animate-fade-up"
            style={{ marginBottom: 24, display: 'inline-flex' }}
          >
            <Star size={11} />
            Gratuit pour toujours
          </div>
          <h2
            className="animate-fade-up delay-100"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: 20,
            }}
          >
            Prêt à imprimer vos{' '}
            <span className="text-gradient">premières cartes ?</span>
          </h2>
          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              maxWidth: 440,
              margin: '0 auto 44px',
              lineHeight: 1.7,
            }}
          >
            Aucune inscription. Aucune installation. Lancez l&apos;outil
            directement dans votre navigateur.
          </p>
          <div
            className="animate-fade-up delay-300"
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/app"
              className="btn-primary"
              style={{ padding: '14px 36px', fontSize: 15 }}
            >
              Ouvrir l&apos;outil
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '32px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background:
                'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Layers size={13} color="#070b14" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-secondary)',
            }}
          >
            CardPrinter
          </span>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Made with ♥ by{' '}
          <a
            href="https://github.com/dodalpaga"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
          >
            Dorian VOYDIE
          </a>{' '}
          · Open Source sous MIT
        </div>

        <a
          href="https://github.com/dodalpaga/Board-Game-Card-Printer"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color =
              'var(--text-secondary)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = 'var(--text-muted)')
          }
        >
          <Github size={14} />
          GitHub
        </a>
      </footer>
    </div>
  );
}
