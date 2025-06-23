import Navbar from '@/components/Navbar';
import ClimateGlobe from '@/components/ClimateGlobe';
import DataTable from '@/components/DataTable';
import { getAvailableDates, getNasaTableData } from '@/lib/data';

export default async function HomePage() {
  // Ces fonctions s'exécutent sur le serveur !
  const availableDates = await getAvailableDates();
  const tableData = await getNasaTableData();

  console.log("Vérification des données sur le SERVEUR (3 premières lignes) :");
  console.log(tableData.slice(0, 3));

  return (
    <>
      <Navbar />
      
      <main>
        {/* Section description - maintenant séparée et au-dessus */}
        <div className="description-section" id="visualization">
          <div className="container">
            <article>
              <h2>NASA GISTEMP Visualization</h2>
              <p>
                Cette application interactive visualise les anomalies de température globale provenant du dataset NASA GISTEMP.
                Les couleurs sur le globe représentent les écarts de température par rapport à la période de référence (1951-1980).
              </p>
              <p><strong>Comment utiliser :</strong></p>
              <ul>
                <li>Sélectionnez une année et un mois dans les menus déroulants</li>
                <li>Le globe se mettra à jour pour afficher les anomalies de température pour cette période</li>
                <li>Utilisez votre souris pour faire pivoter, zoomer et déplacer le globe</li>
                <li>Les couleurs rouges indiquent un réchauffement, les bleues un refroidissement</li>
              </ul>
              <div className="color-scale">
                <div className="scale-label">-5°C</div>
                <div className="gradient"></div>
                <div className="scale-label">+5°C</div>
              </div>
              <p>
                NASA GISTEMP (Goddard Institute for Space Studies Surface Temperature Analysis) fournit une estimation des changements 
                de température à la surface du globe.
              </p>
              <p><small>Source des données : NASA Goddard Institute for Space Studies</small></p>
            </article>
          </div>
        </div>

        {/* Section globe - maintenant pleine largeur */}
        <div className="globe-section">
          {/* Le composant client reçoit les données pré-chargées du serveur */}
          <ClimateGlobe availableDates={availableDates} />
        </div>

        <div className="data-section" id="data">
          <h2>Données mensuelles de température globale</h2>
          {/* Le composant client reçoit les données pré-chargées du serveur */}
          <DataTable initialData={tableData} />
        </div>

        <div className="data-section" id="about">
          <h2>À propos de ce projet</h2>
          <p>
            Cette application a été recréée avec Next.js 15 (App Router) et Three.js. Elle utilise les Server Components pour le rendu initial et les Server Actions pour les mises à jour de données, offrant une expérience rapide et moderne.
          </p>
          <p>
            Le code source est disponible sur <a href="#">GitHub</a>.
          </p>
        </div>
      </main>
    </>
  );
}