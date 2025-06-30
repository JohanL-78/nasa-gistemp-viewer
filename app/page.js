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
          <h2>À propos</h2>
  <p>
    Visualisation interactive des anomalies de température NASA GISTEMP (1880-2024)
  </p>
  <p>
    Construit avec Next.js 15 & Three.js par <strong>Johan Lorck</strong>
  </p>
  <p>
    <a href="https://github.com/JohanL-78/nasa-gistemp-viewer">Voir le code source</a>
  </p>
        </div>
      </main>
    </>
  );
}