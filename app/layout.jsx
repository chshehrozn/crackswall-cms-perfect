import "./globals.css";
import { readTheme } from '@/lib/theme';

import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  const cookieStore = await cookies();
  const urlCookie = cookieStore.get('cms_api_url')?.value;
  let baseUrl = 'http://localhost:3001';
  if (urlCookie) {
    baseUrl = decodeURIComponent(urlCookie).replace(/\/api$/, '').replace(/\/$/, '');
  }
  return `${baseUrl}${path}`;
}

export async function generateMetadata() {
  const theme = await readTheme();
  const siteName = theme?.site?.name || 'CracksWall';
  const favicon = await resolveUrl(theme?.site?.favicon);

  return {
    title: `${siteName} Dashboard`,
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
