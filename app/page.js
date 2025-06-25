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
 

        {/* Section globe - maintenant pleine largeur */}
        <div className="globe-section">
          {/* Le composant client reçoit les données pré-chargées du serveur */}
          <ClimateGlobe availableDates={availableDates} />
        </div>
        {/*<div className="color-scale" style={{ display: 'flex', justifyContent: 'center'}}>
                <div className="scale-label">-5°C</div>
                <div className="gradient"></div>
                <div className="scale-label">+5°C</div>
              </div> */}

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