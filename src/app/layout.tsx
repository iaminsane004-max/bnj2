import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bake & Joy | Fresh baked, straight to your door',
  description:
    'Freshly baked artisan cakes, cookies, breads, pastries, and seasonal treats. Order online and get them delivered to your doorstep in minutes! Direct payment to owner.',
  keywords: ['bakery', 'quick commerce', 'artisan cakes', 'fresh bread', 'pastries', 'cookies'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased font-sansScroll`}
    >
      <body className="min-h-full flex flex-col bg-brand-cream text-brand-brown">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
