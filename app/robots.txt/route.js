export function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: https://nasa-gistemp-viewer.vercel.app/sitemap.xml`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}