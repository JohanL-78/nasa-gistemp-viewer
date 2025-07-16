import "../globals.css";
import translations from '../../locales/translations.json';
import { LocaleProvider } from '@/contexts/LocaleContext';

export async function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }];
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale || 'fr';
  const t = translations[locale] || translations.fr;
  
  return {
    title: t.site.title,
    description: t.site.description,
    keywords: t.site.keywords,
    authors: [{ name: "Johan Lorck" }],
    creator: "Johan Lorck",
    alternates: {
      canonical: `https://nasa-gistemp-viewer.vercel.app/${locale}`,
      languages: {
        'fr': 'https://nasa-gistemp-viewer.vercel.app/fr',
        'en': 'https://nasa-gistemp-viewer.vercel.app/en',
      },
    },
    openGraph: {
      title: t.site.title,
      description: t.site.description,
      url: `https://nasa-gistemp-viewer.vercel.app/${locale}`,
      siteName: "NASA GISTEMP Viewer",
      type: "website",
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      images: [
        {
          url: "https://nasa-gistemp-viewer.vercel.app/screenshots/ClimateGlobe.png",
          width: 1200,
          height: 630,
          alt: locale === 'en' ? 
            "Interactive 3D globe showing NASA GISTEMP temperature anomalies" :
            "Globe 3D interactif montrant les anomalies de température NASA GISTEMP",
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.site.title,
      description: t.site.description,
      images: ["https://nasa-gistemp-viewer.vercel.app/screenshots/ClimateGlobe.png"],
      creator: "@johanlorck",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = translations[locale] || translations.fr;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.site.title,
    description: t.site.description,
    url: `https://nasa-gistemp-viewer.vercel.app/${locale}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    creator: {
      '@type': 'Person',
      name: 'Johan Lorck',
      url: 'https://github.com/johanlorck'
    },
    keywords: t.site.keywords,
    inLanguage: locale,
    about: {
      '@type': 'Thing',
      name: 'Climate Change',
      description: 'NASA GISTEMP temperature anomaly data visualization'
    }
  };
  
  return (
    <html lang={resolvedParams.locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <LocaleProvider locale={resolvedParams.locale}>
          <div className="main-container">
            {children}
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}