import { cookies } from 'next/headers';
import { query } from '@/lib/db';

export async function GET() {
  const cookieStore = await cookies();
  const urlCookie = cookieStore.get('cms_api_url')?.value;
  let baseUrl = 'http://localhost:3001';
  if (urlCookie) {
    baseUrl = decodeURIComponent(urlCookie).replace(/\/api$/, '').replace(/\/$/, '');
  }

  try {
    const [blogs, categories] = await Promise.all([
      query("SELECT slugs, updated_at FROM blogs WHERE status='Active' AND is_deleted IS NULL"),
      query("SELECT slug FROM slip_categories WHERE status='Active' AND category_id=0")
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Add categories
    categories.forEach(cat => {
      xml += `
  <url>
    <loc>${baseUrl}/${cat.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add blogs
    blogs.forEach(blog => {
      const lastMod = blog.updated_at ? new Date(blog.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `
  <url>
    <loc>${baseUrl}/pc-games/${blog.slugs}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (err) {
    return new Response('Error generating sitemap', { status: 500 });
  }
}
