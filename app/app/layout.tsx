'use client';
import React from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // The sidebar is managed inside the app page itself since it needs
  // access to tab/counts state. This layout just provides the dark shell.
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-base)',
        display: 'flex',
        fontFamily: 'var(--font-body)',
      }}
    >
      {children}
    </div>
  );
}
