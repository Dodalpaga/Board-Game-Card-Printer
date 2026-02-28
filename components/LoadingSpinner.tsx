// components/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  progress?: number;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Chargement...',
  progress,
  fullScreen = false,
}) => {
  const content = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      {/* Custom spinner */}
      <div style={{ position: 'relative', width: 44, height: 44 }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid var(--border-default)',
            position: 'absolute',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent-cyan)',
            borderRightColor: 'rgba(0,212,255,0.3)',
            position: 'absolute',
            animation: 'spin 0.9s linear infinite',
            boxShadow: '0 0 12px rgba(0,212,255,0.3)',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            margin: 0,
            fontFamily: 'var(--font-body)',
          }}
        >
          {message}
        </p>

        {progress !== undefined && (
          <div style={{ marginTop: 14, width: 220 }}>
            <div
              style={{
                width: '100%',
                height: 4,
                background: 'var(--bg-elevated)',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, progress))}%`,
                  background:
                    'linear-gradient(90deg, var(--accent-cyan), var(--accent-indigo))',
                  borderRadius: 99,
                  transition: 'width 0.3s ease',
                  boxShadow: '0 0 8px rgba(0,212,255,0.4)',
                }}
              />
            </div>
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 6,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
              }}
            >
              {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7,11,20,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 0',
      }}
    >
      {content}
    </div>
  );
};
