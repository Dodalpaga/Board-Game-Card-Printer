// app/app/layout.tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Intentionally bare — the page component owns the full-screen wrapper
  // with dynamic theme CSS variables. A background here would sit outside
  // the themed div and stay dark forever.
  return <>{children}</>;
}
