// lib/data.js - Version optimisée pour plusieurs sources NASA (GLB, NH, SH) + ONI
import fs from 'fs/promises';
import path from 'path';
import https from 'https';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const CACHE_DURATION = 2 * 24 * 60 * 60 * 1000; // 48 heures

const NASA_URLS = {
  global: 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv',
  north: 'https://data.giss.nasa.gov/gistemp/tabledata_v4/NH.Ts+dSST.csv',
  south: 'https://data.giss.nasa.gov/gistemp/tabledata_v4/SH.Ts+dSST.csv',
};

const CACHE_FILES = {
  global: path.join(process.cwd(), 'cache_global.csv'),
  north: path.join(process.cwd(), 'cache_nh.csv'),
  south: path.join(process.cwd(), 'cache_sh.csv'),
};

const fetchLocks = {
  global: { isFetching: false, promise: null },
  north: { isFetching: false, promise: null },
  south: { isFetching: false, promise: null },
};

const ONI_URL = 'https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt';
const CACHE_FILE_ONI = path.join(process.cwd(), 'cache_oni.txt');

// --- NASA FETCH ---
function fetchNasaData(source = 'global') {
  return new Promise((resolve, reject) => {
    const url = new URL(NASA_URLS[source]);
    console.log(`📱 Récupération des données NASA (${source}) via ${url.hostname}`);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        'Accept': 'text/csv,*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache'
      },
      family: 4,
      timeout: 30000
    };

    let data = '';

    const req = https.request(options, (res) => {
      console.log(`🗕️ Réponse reçue: HTTP ${res.statusCode}`);

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`↪ Redirection vers: ${res.headers.location}`);
        fetchNasaData(source).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Erreur HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✅ Données reçues: ${data.length} caractères`);
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error(`❌ Erreur de connexion: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('❌ Timeout de la requête');
      req.destroy();
      reject(new Error('Timeout de connexion (30s)'));
    });

    req.end();
  });
}

export async function fetchAndCacheNasaData(source = 'global') {
  const CACHE_FILE = CACHE_FILES[source];
  const lock = fetchLocks[source];
  const stats = await fs.stat(CACHE_FILE).catch(() => null);
  const age = stats ? Date.now() - stats.mtimeMs : Infinity;

  if (age < CACHE_DURATION) {
    console.log(`✅ Cache valide (${source}) (âge: ${Math.round(age / 60000)} min)`);
    return;
  }

  if (lock.isFetching && lock.promise) {
    console.log(`⏳ Attente d'une mise à jour du cache (${source}) déjà en cours...`);
    await lock.promise;
    return;
  }

  lock.isFetching = true;
  lock.promise = (async () => {
    try {
      console.log(`🚀 Début mise à jour du cache (${source}) (âge: ${Math.round(age / 60000)} min)`);
      const rawData = await fetchNasaData(source);

      if (!rawData || rawData.length < 1000 || !rawData.includes('Year,Jan')) {
        throw new Error("Données invalides ou incomplètes");
      }

      const cleanedData = rawData.replace(/\*\*\*/g, '');
      await fs.writeFile(CACHE_FILE, cleanedData);
      console.log("📂 Cache mis à jour avec succès !");
    } catch (error) {
      console.error(`❌ Échec de la mise à jour du cache (${source}): ${error.message}`);

      if (stats && stats.size > 0) {
        console.warn("⚠️ Utilisation du cache expiré");
        return;
      }

      console.warn("🏢 Création d'un cache d'urgence minimal...");
      const emergencyData = `Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N,DJF,MAM,JJA,SON\n2024,1.20,1.37,1.28,1.11,1.05,1.17,1.21,1.23,1.17,1.15,1.12,1.15,1.19,,1.23,1.15,1.20,1.15\n2023,0.87,0.97,1.20,1.00,0.93,1.08,1.19,1.27,1.49,1.37,1.46,1.52,1.19,1.15,0.95,1.04,1.18,1.44\n2022,0.91,0.89,1.05,0.84,0.84,0.92,0.93,0.95,0.90,0.97,0.72,0.79,0.89,0.94,1.16,0.91,0.93,0.86`;
      await fs.writeFile(CACHE_FILE, emergencyData);
      console.log("✅ Cache d'urgence créé");
    } finally {
      lock.isFetching = false;
      lock.promise = null;
    }
  })();

  return lock.promise;
}

// --- Parsing CSV NASA ---
async function parseCSV(source = 'global') {
  await fetchAndCacheNasaData(source);
  const CACHE_FILE = CACHE_FILES[source];
  const csvData = await fs.readFile(CACHE_FILE, 'utf-8');
  const lines = csvData.trim().split('\n');
  const dataLines = lines.slice(1);
  return dataLines.map(line => line.split(',').map(cell => cell.trim()));
}

export async function getAvailableDates(source = 'global') {
  const parsedData = await parseCSV(source);
  const years = parsedData.map(row => row[0]).filter(Boolean).map(Number);

  const lastValid = [...parsedData].reverse().find(row =>
    row.some((cell, i) => i > 0 && !isNaN(parseFloat(cell)))
  );

  const current_year = lastValid?.[0];
  const current_month = (() => {
    if (!lastValid) return '01';
    let lastMonthIndex = -1;
    for (let i = 1; i <= 12; i++) {
      if (!isNaN(parseFloat(lastValid[i]))) {
        lastMonthIndex = i;
      }
    }
    return String(lastMonthIndex).padStart(2, '0');
  })();

  const months = [
    { value: "01", name: "Jan" }, { value: "02", name: "Fév" }, { value: "03", name: "Mar" },
    { value: "04", name: "Avr" }, { value: "05", name: "Mai" }, { value: "06", name: "Juin" },
    { value: "07", name: "Juil" }, { value: "08", name: "Aoû" }, { value: "09", name: "Sep" },
    { value: "10", name: "Oct" }, { value: "11", name: "Nov" }, { value: "12", name: "Déc" }
  ];

  return {
    years: years.sort((a, b) => b - a),
    months,
    current_year,
    current_month
  };
}

export async function getNasaTableData(source = 'global') {
  await fetchAndCacheNasaData(source);
  const CACHE_FILE = CACHE_FILES[source];
  const csvData = await fs.readFile(CACHE_FILE, 'utf-8');
  const lines = csvData.trim().split('\n');
  const header = lines[0].split(',').map(cell => cell.trim());
  const dataLines = lines.slice(1);
  const parsedData = dataLines.map(line => line.split(',').map(cell => cell.trim()));
  return [header, ...parsedData];
}

export async function getTemperatureForDate(year, month, source = 'global') {
  const parsedData = await parseCSV(source);
  const monthIndex = parseInt(month, 10);
  if (monthIndex < 1 || monthIndex > 12) return null;
  const colIndex = monthIndex;
  const yearRow = parsedData.find(row => row[0] === String(year));
  if (!yearRow || !yearRow[colIndex] || yearRow[colIndex] === '') return null;
  return parseFloat(yearRow[colIndex]);
}

// --- ONI FETCH & PARSE ---
export async function fetchAndCacheOniData() {
  const stats = await fs.stat(CACHE_FILE_ONI).catch(() => null);
  const age = stats ? Date.now() - stats.mtimeMs : Infinity;
  if (age < CACHE_DURATION) return;

  try {
    const raw = await new Promise((resolve, reject) => {
      const url = new URL(ONI_URL);
      const options = {
        hostname: url.hostname,
        path: url.pathname,
        method: 'GET',
        family: 4,
        timeout: 10000
      };
      let data = '';
      const req = https.request(options, res => {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error("Timeout ONI"));
      });
      req.end();
    });

    console.log("✅ Contenu ONI récupéré, écriture en cours");
    await fs.writeFile(CACHE_FILE_ONI, raw);
    console.log("✅ Cache ONI mis à jour");
  } catch (err) {
    console.error("❌ Échec récupération ONI:", err.message);
  }
}

const oniSeasonByMonth = {
  '01': 'NDJ', '02': 'DJF', '03': 'JFM', '04': 'FMA',
  '05': 'MAM', '06': 'AMJ', '07': 'MJJ', '08': 'JJA',
  '09': 'JAS', '10': 'ASO', '11': 'SON', '12': 'OND'
};

function getOniSeasonAndYear(year, month) {
  const season = oniSeasonByMonth[month];
  const y = parseInt(year, 10);
  if (season === 'NDJ') return { season, year: y - 1 };
  return { season, year: y };
}

export async function getOniIndex(year, month) {
  await fetchAndCacheOniData();
  const content = await fs.readFile(CACHE_FILE_ONI, 'utf-8');

  const { season, year: oniYear } = getOniSeasonAndYear(year, month);
  const lines = content.trim().split('\n');

  console.log(`🔎 Recherche ONI pour ${oniYear} ${season}...`);

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) continue;

    const tri = parts[0].trim().toUpperCase(); // ex: DJF
    const yr = parseInt(parts[1]);             // ex: 1950
    const val = parseFloat(parts[3]);          // ex: -1.53


    if (tri === season.toUpperCase() && yr === oniYear) {
      console.log(`✅ Trouvé ONI: ${val} (${season} ${oniYear})`);
      return isNaN(val) ? null : val;
    }
  }

  console.warn(`❌ Aucune donnée ONI trouvée pour ${oniYear} ${season}`);
  return null;
}