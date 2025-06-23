// test-nasa-fetch.js - Testez chaque méthode individuellement
const { exec } = require('child_process');
const { promisify } = require('util');
const https = require('https');
const dns = require('dns');
const os = require('os');

const execAsync = promisify(exec);
const NASA_URL = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv';

console.log('🧪 Test des différentes méthodes de récupération des données NASA\n');

// Test 1: curl
async function testCurl() {
  console.log('1️⃣ Test avec curl (IPv4):');
  try {
    const start = Date.now();
    const { stdout } = await execAsync(`curl -4 -L -s -m 10 "${NASA_URL}"`);
    const time = Date.now() - start;
    console.log(`   ✅ Succès! Temps: ${time}ms, Taille: ${stdout.length} caractères`);
    return true;
  } catch (error) {
    console.log(`   ❌ Échec: ${error.message}`);
    return false;
  }
}

// Test 2: wget
async function testWget() {
  console.log('\n2️⃣ Test avec wget (IPv4):');
  try {
    const start = Date.now();
    const { stdout } = await execAsync(`wget -4 -q -O - --timeout=10 "${NASA_URL}"`);
    const time = Date.now() - start;
    console.log(`   ✅ Succès! Temps: ${time}ms, Taille: ${stdout.length} caractères`);
    return true;
  } catch (error) {
    console.log(`   ❌ Échec: ${error.message}`);
    return false;
  }
}

// Test 3: fetch natif
async function testNativeFetch() {
  console.log('\n3️⃣ Test avec fetch natif:');
  console.log(`   Node.js version: ${process.version}`);
  
  if (typeof fetch === 'undefined') {
    console.log('   ❌ fetch non disponible (Node.js < 18)');
    return false;
  }
  
  try {
    const start = Date.now();
    const response = await fetch(NASA_URL, {
      signal: AbortSignal.timeout(10000)
    });
    const text = await response.text();
    const time = Date.now() - start;
    console.log(`   ✅ Succès! Temps: ${time}ms, Taille: ${text.length} caractères`);
    return true;
  } catch (error) {
    console.log(`   ❌ Échec: ${error.message}`);
    return false;
  }
}

// Test 4: https natif avec IPv4
async function testHttpsNative() {
  console.log('\n4️⃣ Test avec https natif (IPv4 forcé):');
  
  // Tester d'abord la résolution DNS
  try {
    dns.setDefaultResultOrder('ipv4first');
    const addresses = await promisify(dns.resolve4)('data.giss.nasa.gov');
    console.log(`   📡 Adresses IPv4 trouvées: ${addresses.join(', ')}`);
  } catch (error) {
    console.log(`   ⚠️ Erreur DNS: ${error.message}`);
  }
  
  return new Promise((resolve) => {
    const start = Date.now();
    const url = new URL(NASA_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Node.js test)',
        'Accept': 'text/csv'
      },
      family: 4, // IPv4 uniquement
      timeout: 10000
    };
    
    let data = '';
    
    const req = https.request(options, (res) => {
      console.log(`   📥 Réponse HTTP: ${res.statusCode}`);
      
      if (res.statusCode !== 200) {
        console.log(`   ❌ Échec: HTTP ${res.statusCode}`);
        resolve(false);
        return;
      }
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const time = Date.now() - start;
        console.log(`   ✅ Succès! Temps: ${time}ms, Taille: ${data.length} caractères`);
        resolve(true);
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Échec: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('   ❌ Échec: Timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Exécuter tous les tests
async function runAllTests() {
  const results = {
    curl: await testCurl(),
    wget: await testWget(),
    nativeFetch: await testNativeFetch(),
    httpsNative: await testHttpsNative()
  };
  
  console.log('\n📊 Résumé des tests:');
  console.log('─────────────────────');
  
  const working = Object.entries(results)
    .filter(([_, success]) => success)
    .map(([method]) => method);
  
  if (working.length > 0) {
    console.log(`✅ Méthodes fonctionnelles: ${working.join(', ')}`);
    console.log(`\n💡 Recommandation: La méthode "${working[0]}" est la plus rapide sur votre système.`);
  } else {
    console.log('❌ Aucune méthode n\'a fonctionné!');
    console.log('\n🔧 Solutions possibles:');
    console.log('   - Vérifier votre connexion internet');
    console.log('   - Vérifier les paramètres de firewall/proxy');
    console.log('   - Installer curl ou wget');
    console.log('   - Mettre à jour Node.js vers la version 18+');
  }
  
  // Informations système utiles
  console.log('\n📋 Informations système:');
  console.log(`   - Node.js: ${process.version}`);
  console.log(`   - OS: ${process.platform} ${process.arch}`);
  
  // Vérifier IPv6
  const interfaces = os.networkInterfaces();
  const hasIPv6 = Object.values(interfaces).flat().some(i => i.family === 'IPv6');
  console.log(`   - IPv6 supporté: ${hasIPv6 ? 'Oui' : 'Non'}`);
}

runAllTests().catch(console.error);