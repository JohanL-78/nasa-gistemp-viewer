'use server';

import { getTemperatureForDate, getOniIndex } from './data';

export async function getTemperatureDataAction(year, month) {
  try {
    // Récupération des 3 températures et de l’ONI en parallèle
    const [globalTemp, northTemp, southTemp, oni] = await Promise.all([
      getTemperatureForDate(year, month, 'global'),
      getTemperatureForDate(year, month, 'north'),
      getTemperatureForDate(year, month, 'south'),
      getOniIndex(year, month)
    ]);

    const result = {
      temperature: globalTemp, // rétrocompatibilité
      global: globalTemp,
      north: northTemp,
      south: southTemp,
      oni
    };

    console.log('🌡️ Résultat température période A :', result);
    return result;

  } catch (error) {
    console.error(`Erreur dans la Server Action getTemperatureDataAction: ${error.message}`);
    return { 
      error: 'Impossible de récupérer les températures.',
      temperature: null,
      global: null,
      north: null,
      south: null,
      oni: null
    };
  }
}
