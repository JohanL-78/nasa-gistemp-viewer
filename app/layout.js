import "./globals.css";

export const metadata = {
  title: "NASA GISTEMP Viewer – Visualisation 3D des anomalies climatiques",
  description:
    "Explorez les anomalies de température globale depuis 1880 avec un globe 3D interactif. Données NASA GISTEMP et NOAA, visualisation moderne en React/Next.js.",
  keywords:
    "NASA GISTEMP, anomalies de température, climat, globe 3D, visualisation climatique, changement climatique, température globale, données climat",
  authors: [{ name: "Johan Lorck" }],
  creator: "Johan Lorck",
  openGraph: {
    title: "NASA GISTEMP Viewer – Visualisation 3D des anomalies climatiques",
    description:
      "Application web interactive pour explorer les données climatiques de la NASA depuis 1880 à travers un globe 3D dynamique.",
    url: "https://nasa-gistemp-viewer.vercel.app",
    siteName: "NASA GISTEMP Viewer",
    type: "website",
    locale: "fr_FR"
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