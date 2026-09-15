import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ComplyOS — Security Compliance Management Platform',
  description: 'Centralized compliance operating system for managing frameworks, controls, evidence, risks, and audits.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <Sidebar />
          <div className="md:ml-64">
            <Topbar />
            <main className="p-6 animate-fade-in">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
