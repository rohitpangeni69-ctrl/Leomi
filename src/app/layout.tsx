import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Prevents zooming on inputs for mobile native feel
};

export const metadata: Metadata = {
  title: "Leomi | Nepal's Next Era of Fashion",
  description: 'Nepal-based fashion & lifestyle platform. Discover trending streetwear, local vendors, and expressive styles via TikTok-inspired Reels.',
  keywords: ['fashion', 'nepal', 'ecommerce', 'streetwear', 'clothing', 'vendors', 'kathmandu'],
  openGraph: {
    title: 'Leomi - Fashion Marketplace',
    description: 'Shop the best local Nepali streetwear and lifestyle brands.',
    url: 'https://leomi.com.np',
    siteName: 'Leomi',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e07?q=80&w=1200&auto=format&fit=crop', // Standard OG image size
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_NP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leomi - Nepal Fashion & Lifestyle',
    description: 'Discover trending local vendors and expressive styles.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-background">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
