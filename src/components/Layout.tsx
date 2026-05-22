import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="relative w-full h-[100dvh] overflow-hidden" style={{ background: 'var(--sky-gradient)' }}>
      {children}
    </div>
  );
}
