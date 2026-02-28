// components/Toast.tsx
import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ToastProps {
  messages: string[];
}

export const Toast: React.FC<ToastProps> = ({ messages }) => {
  if (messages.length === 0) return null;

  const getConfig = (message: string) => {
    if (message.startsWith('✅'))
      return {
        icon: (
          <CheckCircle
            size={16}
            style={{ color: 'var(--success)', flexShrink: 0 }}
          />
        ),
        accentColor: 'var(--success)',
        bg: 'rgba(16,208,122,0.08)',
        border: 'rgba(16,208,122,0.2)',
      };
    if (message.startsWith('❌'))
      return {
        icon: (
          <XCircle
            size={16}
            style={{ color: 'var(--danger)', flexShrink: 0 }}
          />
        ),
        accentColor: 'var(--danger)',
        bg: 'rgba(240,68,68,0.08)',
        border: 'rgba(240,68,68,0.2)',
      };
    return {
      icon: (
        <AlertCircle
          size={16}
          style={{ color: 'var(--warning)', flexShrink: 0 }}
        />
      ),
      accentColor: 'var(--warning)',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
    };
  };

  const cleanMessage = (msg: string) => msg.replace(/^(✅|❌|⚠️)\s*/, '');

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 360,
      }}
    >
      {messages.map((msg, i) => {
        const { icon, accentColor, bg, border } = getConfig(msg);
        return (
          <div
            key={i}
            className="animate-slide-in"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 12,
              background: `color-mix(in srgb, var(--bg-elevated) 90%, ${accentColor} 10%)`,
              border: `1px solid ${border}`,
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {icon}
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary)',
                flex: 1,
                fontFamily: 'var(--font-body)',
              }}
            >
              {cleanMessage(msg)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
