import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'startupShop',
  description: 'Startup listings marketplace MVP'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <header className="topbar">
            <Link href="/" className="brand">
              startupShop
            </Link>
            <div className="meta">MVP marketplace for startup acquisitions</div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
