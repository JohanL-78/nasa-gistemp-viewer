// app/api/table/route.js
import { getNasaTableData, applyReferenceBaseline } from '@/lib/data';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'global';
  const reference = searchParams.get('reference') || null;
  
  let data = await getNasaTableData(source);

  // Supprimer les lignes parasites comme "Land-Ocean: Global Means"
  if (data.length > 0 && !data[0][0].startsWith('Year')) {
    data = data.slice(1);
  }

  // Appliquer la période de référence
  if (reference) {
    try {
      data = await applyReferenceBaseline(data, reference, source);
    } catch (error) {
      console.error('Erreur lors de l\'application de la référence:', error);
      // En cas d'erreur, retourner les données originales
    }
  }

  return Response.json(data);
}
