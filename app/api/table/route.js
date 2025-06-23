// app/api/table/route.js
import { getNasaTableData } from '@/lib/data';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source') || 'global';
  let data = await getNasaTableData(source);

  // Supprimer les lignes parasites comme "Land-Ocean: Global Means"
  if (data.length > 0 && !data[0][0].startsWith('Year')) {
    data = data.slice(1);
  }

  return Response.json(data);
}
