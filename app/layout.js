import "./globals.css";

export const metadata = {
  title: "NASA GISTEMP Viewer – Visualisation 3D des anomalies climatiques",
  description:
    "Explorez les anomalies de température globale depuis 1880 avec un globe 3D interactif. Données NASA GISTEMP et NOAA, visualisation moderne en React/Next.js.",
  keywords:
    "NASA GISTEMP, anomalies de température, température globale NASA, climat, globe 3D, visualisation climatique, changement climatique, température globale, données climat",
  authors: [{ name: "Johan Lorck" }],
  creator: "Johan Lorck",
  openGraph: {
    title: "NASA GISTEMP Viewer – Visualisation 3D des anomalies climatiques",
    description:
      "Application web interactive pour explorer les données climatiques de la NASA depuis 1880 à travers un globe 3D dynamique.",
    url: "https://nasa-gistemp-viewer.vercel.app",
    siteName: "NASA GISTEMP Viewer",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "https://nasa-gistemp-viewer.vercel.app/screenshots/ClimateGlobe.png",
        width: 1200,
        height: 630,
        alt: "Globe 3D interactif montrant les anomalies de température NASA GISTEMP",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NASA GISTEMP Viewer – Visualisation 3D des anomalies climatiques",
    description: "Explorez les anomalies de température globale depuis 1880 avec un globe 3D interactif basé sur les données NASA GISTEMP.",
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


export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <div className="main-container">
          {children}
        </div>
      </body>
    </html>
  );
}