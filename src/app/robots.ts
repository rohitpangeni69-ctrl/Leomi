import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leomi.com.np';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',       // Hide admin panels from search engines
        '/checkout/',    // Hide transactional checkout pages
        '/cart/',        // Cart state is user-specific
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
