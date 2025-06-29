import "./globals.css";

export const metadata = {
  title: "NASA GISTEMP Temperature Anomaly Visualizer",
  description: "Visualisation des anomalies de température globale NASA Gistemp, illustrant le réchauffement climatique, avec Next.js et Three.js",
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