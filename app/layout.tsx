import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gestionnaire de Cartes | Print & Play',
  description:
    'Outil web pour préparer et imprimer vos cartes de jeu de société. Upload, association recto/verso et mise en page optimisée sur A4.',
  keywords: [
    'cartes',
    'jeu de société',
    'print and play',
    'impression',
    'prototype',
    'board game',
  ],
  authors: [{ name: 'Dorian VOYDIE' }],
  creator: 'Dorian VOYDIE',

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://dodalpaga.github.io/Board-Game-Card-Printer/',
    title: 'Gestionnaire de Cartes | Print & Play',
    description: 'Créez et imprimez vos cartes de jeu de société facilement',
    siteName: 'Card Manager',
    images: [
      {
        url: '/og-image.png', // Créez cette image (1200x630px)
        width: 1200,
        height: 630,
        alt: 'Gestionnaire de Cartes',
      },
    ],
  },

  // Favicon et icônes
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

  // Manifest pour PWA (optionnel)
  manifest: '/manifest.json',

  // Métadonnées additionnelles
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <meta name="apple-mobile-web-app-title" content="CardPrinter" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
