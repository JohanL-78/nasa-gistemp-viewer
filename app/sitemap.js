export default function sitemap() {
  const baseUrl = 'https://nasa-gistemp-viewer.vercel.app';
  const lastModified = new Date().toISOString();

  return [
    {
      url: `${baseUrl}/fr`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}