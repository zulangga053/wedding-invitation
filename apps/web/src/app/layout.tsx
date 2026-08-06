import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Playfair_Display, Poppins } from 'next/font/google';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Momentia — Undangan Digital Premium',
    template: '%s · Momentia',
  },
  description:
    'Platform undangan digital premium untuk pernikahan, ulang tahun, aqiqah, dan acara lainnya.',
  applicationName: 'Momentia',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#B88A44',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${poppins.variable} min-h-full font-sans`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}