import PageContent from '@/components/PageContent';
import { getAvailableDates, getNasaTableData } from '@/lib/data';

export default async function HomePage({ params }) {
  const resolvedParams = await params;
  const availableDates = await getAvailableDates();
  const tableData = await getNasaTableData();

  console.log("Vérification des données sur le SERVEUR (3 premières lignes) :");
  console.log(tableData.slice(0, 3));

  return (
    <PageContent 
      availableDates={availableDates} 
      tableData={tableData}
      locale={resolvedParams.locale}
    />
  );
}