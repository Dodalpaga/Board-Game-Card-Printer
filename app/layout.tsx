// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#070b14',
};

export const metadata: Metadata = {
  title: {
    default: 'CardPrinter — Print & Play',
    template: '%s · CardPrinter',
  },
  description:
    'Outil web open source pour préparer et imprimer vos cartes de jeu de société. Upload, association recto/verso et mise en page optimisée sur A4.',
  keywords: [
    'cartes',
    'jeu de société',
    'print and play',
    'impression',
    'prototype',
    'board game',
    'PDF',
    'A4',
  ],
  authors: [{ name: 'Dorian VOYDIE', url: 'https://github.com/dodalpaga' }],
  creator: 'Dorian VOYDIE',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dodalpaga.github.io/Board-Game-Card-Printer/',
    title: 'CardPrinter — Print & Play',
    description: 'Créez et imprimez vos cartes de jeu de société facilement.',
    siteName: 'CardPrinter',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="apple-mobile-web-app-title" content="CardPrinter" />
        {/* Google Fonts loaded via globals.css @import */}
      </head>
      <body>{children}</body>
    </html>
  );
}
