'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTemperatureDataAction } from '@/lib/actions';

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

extend({
  SphereGeometry: THREE.SphereGeometry,
  MeshLambertMaterial: THREE.MeshLambertMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial,
});

const Globe = ({ year, month, isVisible, autoRotate, onLoad, globeRef }) => {
  const groupRef = useRef();
  const baseMeshRef = useRef();
  const [temperatureTexture, setTemperatureTexture] = useState(null);
  const [overlayTexture, setOverlayTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedKey, setLastLoadedKey] = useState('');
  const instanceId = useRef(Math.random().toString(36).slice(2, 11)).current;

  useFrame(() => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += 0.001;
  });

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
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.flipY = true;
    tex.needsUpdate = true;
    tex.uuid = THREE.MathUtils.generateUUID();

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
    loader.load(`/textures/default_earth.jpg?i=${instanceId}&t=${Date.now()}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.flipY = true;
      tex.needsUpdate = true;
      tex.uuid = THREE.MathUtils.generateUUID();

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

if (onLoad && lastLoadedKey !== key) {
  getTemperatureDataAction(year, month)
    .then((res) => onLoad(res ?? {}))
    .catch(() => setIsLoading(false));
}

  }, [year, month, onLoad, lastLoadedKey, isLoading, instanceId]);

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
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.uuid = THREE.MathUtils.generateUUID();
      setOverlayTexture(tex);
    });
  }, [overlayTexture, instanceId]);

  useEffect(() => {
    if (globeRef) globeRef.current = { group: groupRef.current, base: baseMeshRef.current, instanceId };
  }, [globeRef, instanceId]);

  useEffect(() => () => {
    temperatureTexture?.dispose();
    overlayTexture?.dispose();
  }, [temperatureTexture, overlayTexture]);

  return (
    <group ref={groupRef} rotation-x={0.2} visible={isVisible}>
      
      <mesh ref={baseMeshRef} rotation-x={0.2}>
  <sphereGeometry args={[1, 128, 64]} />
  <meshBasicMaterial map={temperatureTexture} transparent={true} toneMapped={false} />
</mesh>
      {overlayTexture && (
        <mesh rotation-x={0.2}>
          <sphereGeometry args={[1.001, 128, 64]} />
          <meshBasicMaterial map={overlayTexture} transparent opacity={0.33} depthWrite={false} blending={THREE.MultiplyBlending} alphaTest={0.1} />
        </mesh>
      )}
    </group>
  );
};

const Scene = ({ children }) => (
  <>
   <hemisphereLight skyColor={0xffffff} groundColor={0x888888} intensity={1.5} />
   <directionalLight
      position={[0, -3, 0]}      // vient du dessous
      intensity={0.5}
      color={0xffffff}
    />
     {children}
  </>
  
);

export default function CanvasGlobe({ availableDates }) {
  const isMobile = useIsMobile();
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [year, setYear] = useState(availableDates.current_year);
  const [month, setMonth] = useState(availableDates.current_month);
  const [temps, setTemps] = useState({});
  const globeRef = useRef(null);

  const overlayStyle = {
    position: 'absolute',
    top: '2.3rem',
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

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100%' }}>
      <div
  style={{
    width: isMobile ? '100%' : '300px',
    flexShrink: 0,
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
        <h3 style={{ marginBottom: '1rem' }}>📅 Période</h3>
        <input type="text" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Année" style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
        <input type="text" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="Mois" style={{ width: '100%', padding: '0.5rem', background: '#222', color: '#fff', border: '1px solid #444' }} />
        <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#ccc' }}>
          <p>🌍 Global: {temps.global !== null ? `${temps.global?.toFixed(2)}°C` : 'N/A'}</p>
          <p>🧊 Nord: {temps.north !== null ? `${temps.north?.toFixed(2)}°C` : 'N/A'}</p>
          <p>🏔️ Sud: {temps.south !== null ? `${temps.south?.toFixed(2)}°C` : 'N/A'}</p>
          <p>🌊 ONI: {temps.oni !== null ? temps.oni?.toFixed(2) : 'N/A'}</p>
        </div>
      </div>

      <div
  style={{
    flexGrow: 1,
    minWidth: 0,
    maxWidth: '100%',
    height: isMobile ? 'calc(100vh - 300px)' : '100vh',
    position: 'relative',
  }}
>

        <button onClick={() => setControlsOpen((o) => !o)} aria-label="Ouvrir les commandes" style={{
          position: 'absolute',
          right: '1rem',
          top: '2rem',
          zIndex: 11,
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          background: '#000',
          color: '#fff',
          borderRadius: '50%',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          cursor: 'pointer'
        }}>
          ⚙︎
        </button>

        <div style={overlayStyle}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
            Rotation automatique
          </label>
        </div>

        <Canvas key={`${year}-${month}`} camera={{ position: [0, 0, 2.5], fov: 75 }} gl={{ antialias: true, alpha: true }} style={{ width: '100%', height: '100%' }}>
          <Suspense fallback={null}>
            <Scene>
              <Globe year={year} month={month} isVisible={true} autoRotate={autoRotate} onLoad={setTemps} globeRef={globeRef} />
            </Scene>
            <OrbitControls enableDamping dampingFactor={0.1} zoomSpeed={0.3} minDistance={2} maxDistance={5} enablePan={false} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
