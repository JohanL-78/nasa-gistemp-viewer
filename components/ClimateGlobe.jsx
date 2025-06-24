'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTemperatureDataAction } from '@/lib/actions';

/*****************************************************************************************
 * HOOK : true si viewport < 768 px                                                       *
 *****************************************************************************************/
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

/*****************************************************************************************
 * R3F / THREE extensions                                                                 *
 *****************************************************************************************/
extend({
  SphereGeometry: THREE.SphereGeometry,
  MeshLambertMaterial: THREE.MeshLambertMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
});

/*****************************************************************************************
 * GLOBE COMPONENT                                                                        *
 *****************************************************************************************/
const Globe = ({ year, month, isVisible, autoRotate, onLoad, globeRef }) => {
  const groupRef = useRef();
  const baseMeshRef = useRef();

  const [temperatureTexture, setTemperatureTexture] = useState(null);
  const [overlayTexture, setOverlayTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedKey, setLastLoadedKey] = useState('');

  // id unique (debug + cache bust)
  const instanceId = useRef(Math.random().toString(36).slice(2, 11)).current;

  // Auto‑rotate
  useFrame(() => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  // Charger texture température
  useEffect(() => {
    const key = `${year}_${month}`;
    if (!baseMeshRef.current || isLoading || lastLoadedKey === key) return;
    setIsLoading(true);

    const loader = new THREE.TextureLoader();
    const url = `/textures/gistemp_${key}.png?i=${instanceId}&t=${Date.now()}`;

    const setupTexture = (tex) => {
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.flipY = true;
      tex.needsUpdate = true;
      tex.uuid = THREE.MathUtils.generateUUID();
    };

    loader.load(
      url,
      (tex) => {
        setupTexture(tex);
        setTemperatureTexture(tex);
        const mat = baseMeshRef.current.material;
        if (mat.map) mat.map.dispose();
        mat.map = tex;
        mat.needsUpdate = true;
        mat.uuid = THREE.MathUtils.generateUUID();
        setLastLoadedKey(key);
        setIsLoading(false);
      },
      undefined,
      () => {
        // fallback texture
        loader.load(`/textures/default_earth.jpg?i=${instanceId}&t=${Date.now()}`, (tex) => {
          setupTexture(tex);
          setTemperatureTexture(tex);
          const mat = baseMeshRef.current.material;
          if (mat.map) mat.map.dispose();
          mat.map = tex;
          mat.needsUpdate = true;
          mat.uuid = THREE.MathUtils.generateUUID();
          setLastLoadedKey(key);
          setIsLoading(false);
        });
      }
    );

    // Valeurs numériques pour la légende
    if (onLoad && lastLoadedKey !== key) {
      getTemperatureDataAction(year, month)
        .then((res) =>
          onLoad({
            global: res?.global ?? null,
            north: res?.north ?? null,
            south: res?.south ?? null,
            oni: res?.oni ?? null,
          })
        )
        .catch(() => setIsLoading(false));
    }
  }, [year, month, onLoad, lastLoadedKey, isLoading, instanceId]);

  // Charger overlay continents
  useEffect(() => {
    if (overlayTexture) return;
    const loader = new THREE.TextureLoader();
    loader.load(`/textures/overlay.png?i=${instanceId}&t=${Date.now()}`, (tex) => {
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipMapLinearFilter;
      tex.anisotropy = 8;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      tex.uuid = THREE.MathUtils.generateUUID();
      setOverlayTexture(tex);
    });
  }, [overlayTexture, instanceId]);

  // Expose refs
  useEffect(() => {
    if (globeRef) globeRef.current = { group: groupRef.current, base: baseMeshRef.current, instanceId };
  }, [globeRef, instanceId]);

  // Cleanup
  useEffect(() => () => {
    temperatureTexture?.dispose();
    overlayTexture?.dispose();
  }, [temperatureTexture, overlayTexture]);

  return (
    <group ref={groupRef} rotation-x={0.2} visible={isVisible}>
      <mesh ref={baseMeshRef} rotation-x={0.2}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshLambertMaterial transparent color={0xffffff} emissive={0x333333} map={temperatureTexture} />
      </mesh>
      {overlayTexture && (
        <mesh rotation-x={0.2}>
          <sphereGeometry args={[1.001, 128, 64]} />
          <meshBasicMaterial map={overlayTexture} transparent opacity={0.4} depthWrite={false} blending={THREE.MultiplyBlending} alphaTest={0.1} />
        </mesh>
      )}
    </group>
  );
};

/*****************************************************************************************
 * LIGHTS WRAPPER                                                                         *
 *****************************************************************************************/
const Scene = ({ children }) => (
  <>
    <ambientLight intensity={3.0} />
    <directionalLight position={[3, 2, 5]} intensity={2.0} />
    <directionalLight position={[-3, -2, -5]} intensity={1.0} />
    <directionalLight position={[0, 5, 0]} intensity={0.8} />
    <directionalLight position={[0, -5, 0]} intensity={0.8} />
    {children}
  </>
);

/*****************************************************************************************
 * MAIN COMPONENT                                                                         *
 *****************************************************************************************/
export default function CanvasWithControlsOverlay({ availableDates }) {
  // Responsive & UI
  const isMobile = useIsMobile();
  const [autoRotate, setAutoRotate] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(true); // ouvert par défaut

  // Dates sélectionnées
  const [yearA, setYearA] = useState(availableDates.current_year);
  const [monthA, setMonthA] = useState(availableDates.current_month);
  const fallbackYearB = availableDates.years.find((y) => y !== availableDates.current_year) || availableDates.years[0];
  const [yearB, setYearB] = useState(fallbackYearB);
  const [monthB, setMonthB] = useState('01');

  // Températures
  const [tempsA, setTempsA] = useState({ global: null, north: null, south: null, oni: null });
  const [tempsB, setTempsB] = useState({ global: null, north: null, south: null, oni: null });

  // Refs globes
  const globeRefA = useRef(null);
  const globeRefB = useRef(null);

  // Key stable pour OrbitControls
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => setRenderKey(Date.now()), [compareMode]);

  // Affichage valeurs temp
  const displayTemps = (t) => (
    <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#ccc' }}>
      <p>🌍 Global: {t.global !== null ? `${t.global.toFixed(2)}°C` : 'N/A'}</p>
      <p>🧊 Nord: {t.north !== null ? `${t.north.toFixed(2)}°C` : 'N/A'}</p>
      <p>🏔️ Sud: {t.south !== null ? `${t.south.toFixed(2)}°C` : 'N/A'}</p>
      <p>🌊 ONI: {t.oni !== null ? t.oni.toFixed(2) : 'N/A'}</p>
    </div>
  );

  // Canvas helper
  const renderCanvas = (y, m, cb, ref, mode) => (
    <Canvas
      key={`canvas-${mode}-${y}-${m}-${renderKey}`}
      camera={{ position: [0, 0, 2.5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '50%' }}
    >
      <Suspense fallback={null}>
        <Scene>
          <Globe year={y} month={m} isVisible={true} autoRotate={autoRotate} onLoad={cb} globeRef={ref} />
        </Scene>
        <OrbitControls enableDamping dampingFactor={0.1} zoomSpeed={0.3} minDistance={2} maxDistance={5} enablePan={false} />
      </Suspense>
    </Canvas>
  );

  /********* OVERLAY style (dépend de controlsOpen / isMobile) *********/
  const overlayStyle = {
    position: 'absolute',
    top: '50%',
    right: controlsOpen ? '4.5rem' : '-350px',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: '#222',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    color: '#fff',
    maxWidth: isMobile ? 'calc(100% - 5rem)' : '260px',
    transition: 'right 0.3s ease, opacity 0.3s ease',
    opacity: controlsOpen ? 1 : 0,
    pointerEvents: controlsOpen ? 'auto' : 'none',
  };

  /********* RENDER *********/
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100%' }}>
      {/* SIDEBAR */}
      <div
        style={{
          minWidth: isMobile ? '100%' : '280px',
          maxWidth: isMobile ? '100%' : '320px',
          background: '#111',
          color: '#fff',
          padding: '1rem',
          boxShadow: isMobile ? '0 2px 10px rgba(0,0,0,0.3)' : '2px 0 10px rgba(0,0,0,0.3)',
          zIndex: 5,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
        }}
      >
        {/* PERIODE A */}
        <div>
          <h3 style={{ marginBottom: '1rem' }}>📅 Période A</h3>
          <input type="text" value={yearA} onChange={(e) => setYearA(e.target.value)} placeholder="Année" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
          <input type="text" value={monthA} onChange={(e) => setMonthA(e.target.value)} placeholder="Mois" style={{ width: '100%', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
          {displayTemps(tempsA)}
        </div>

        {/* PERIODE B */}
        {compareMode && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>📅 Période B</h3>
            <input type="text" value={yearB} onChange={(e) => setYearB(e.target.value)} placeholder="Année" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
            <input type="text" value={monthB} onChange={(e) => setMonthB(e.target.value)} placeholder="Mois" style={{ width: '100%', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
            {displayTemps(tempsB)}
          </div>
        )}
      </div>

      {/* CANVAS ZONE */}
      <div style={{ flexGrow: 1, minWidth: isMobile ? '100%' : '400px', maxWidth: '100%', height: isMobile ? 'calc(100vh - 300px)' : '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* GEAR BUTTON */}
        <button
          onClick={() => setControlsOpen((o) => !o)}
          aria-label="Ouvrir les commandes"
          style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 11, width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #444', background: '#222', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
        >
          ⚙︎
        </button>

        {/* OVERLAY SLIDING PANEL */}
        <div style={overlayStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={compareMode} onChange={(e) => setCompareMode(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
            Mode comparaison
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
            Rotation automatique
          </label>
        </div>

        {/* CANVASES */}
        {compareMode ? (
          <>
            {renderCanvas(yearA, monthA, setTempsA, globeRefA, 'a')}
            {renderCanvas(yearB, monthB, setTempsB, globeRefB, 'b')}
          </>
        ) : (
          <Canvas key={`solo-${yearA}-${monthA}-${renderKey}`} camera={{ position: [0, 0, 2.5], fov: 75 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
            <Suspense fallback={null}>
              <Scene>
                <Globe year={yearA} month={monthA} isVisible={true} autoRotate={autoRotate} onLoad={setTempsA} globeRef={globeRefA} />
              </Scene>
              <OrbitControls enableDamping dampingFactor={0.1} zoomSpeed={0.3} minDistance={2} maxDistance={5} enablePan={false} />
            </Suspense>
          </Canvas>
        )}
      </div>
    </div>
  );
}
