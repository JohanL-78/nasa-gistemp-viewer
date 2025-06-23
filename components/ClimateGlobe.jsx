'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { getTemperatureDataAction } from '@/lib/actions';

// Hook pour détecter si on est sur mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

extend({ 
  SphereGeometry: THREE.SphereGeometry,
  MeshLambertMaterial: THREE.MeshLambertMaterial,
  MeshBasicMaterial: THREE.MeshBasicMaterial
});

const Globe = ({ year, month, isVisible, autoRotate, onLoad, globeRef }) => {
  const groupRef = useRef();
  const baseMeshRef = useRef();
  const [temperatureTexture, setTemperatureTexture] = useState(null);
  const [overlayTexture, setOverlayTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedKey, setLastLoadedKey] = useState('');
  
  const instanceId = useRef(Math.random().toString(36).substr(2, 9)).current;

  useFrame(() => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  useEffect(() => {
    const currentKey = `${year}_${month}`;
    if (!baseMeshRef.current || isLoading || lastLoadedKey === currentKey) return;
    
    console.log(`🔄 [${instanceId}] Chargement: ${currentKey}`);
    setIsLoading(true);
    
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const uniqueUrl = `/textures/gistemp_${currentKey}.png?instance=${instanceId}&t=${Date.now()}`;

    loader.load(
      uniqueUrl,
      (texture) => {
        console.log(`✅ [${instanceId}] Texture chargée: ${currentKey}`);
        
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.flipY = true;
        texture.needsUpdate = true;
        texture.uuid = THREE.MathUtils.generateUUID();
        
        setTemperatureTexture(texture);
        
        if (baseMeshRef.current) {
          const material = baseMeshRef.current.material;
          if (material.map) {
            material.map.dispose();
          }
          material.map = texture;
          material.needsUpdate = true;
          material.uuid = THREE.MathUtils.generateUUID();
        }
        
        setLastLoadedKey(currentKey);
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.warn(`⚠️ [${instanceId}] Erreur ${currentKey}, fallback...`);
        
        const fallbackUrl = `/textures/default_earth.jpg?instance=${instanceId}&t=${Date.now()}`;
        loader.load(fallbackUrl, (fallbackTex) => {
          fallbackTex.magFilter = THREE.LinearFilter;
          fallbackTex.minFilter = THREE.LinearMipMapLinearFilter;
          fallbackTex.wrapS = THREE.ClampToEdgeWrapping;
          fallbackTex.wrapT = THREE.ClampToEdgeWrapping;
          fallbackTex.flipY = true;
          fallbackTex.needsUpdate = true;
          fallbackTex.uuid = THREE.MathUtils.generateUUID();
          
          setTemperatureTexture(fallbackTex);
          
          if (baseMeshRef.current) {
            const material = baseMeshRef.current.material;
            if (material.map) {
              material.map.dispose();
            }
            material.map = fallbackTex;
            material.needsUpdate = true;
            material.uuid = THREE.MathUtils.generateUUID();
          }
          
          setLastLoadedKey(currentKey);
          setIsLoading(false);
        });
      }
    );

    if (onLoad && lastLoadedKey !== currentKey) {
      getTemperatureDataAction(year, month).then(res => {
        onLoad({
          global: res?.global ?? null,
          north: res?.north ?? null,
          south: res?.south ?? null,
          oni: res?.oni ?? null,
        });
      }).catch(error => {
        console.error(`❌ [${instanceId}] Erreur données:`, error);
        setIsLoading(false);
      });
    }
  }, [year, month, instanceId]);

  useEffect(() => {
    if (overlayTexture) return;
    
    const manager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(manager);
    const overlayUrl = `/textures/overlay.png?instance=${instanceId}&t=${Date.now()}`;
    
    loader.load(overlayUrl, (overlayTex) => {
      overlayTex.magFilter = THREE.LinearFilter;
      overlayTex.minFilter = THREE.LinearMipMapLinearFilter;
      overlayTex.anisotropy = 8;
      overlayTex.wrapS = THREE.ClampToEdgeWrapping;
      overlayTex.wrapT = THREE.ClampToEdgeWrapping;
      overlayTex.needsUpdate = true;
      overlayTex.uuid = THREE.MathUtils.generateUUID();
      setOverlayTexture(overlayTex);
    });
  }, [instanceId]);

  useEffect(() => {
    if (globeRef) {
      globeRef.current = {
        group: groupRef.current,
        base: baseMeshRef.current,
        instanceId: instanceId
      };
    }
  }, [globeRef, instanceId]);

  useEffect(() => {
    return () => {
      console.log(`🗑️ [${instanceId}] Nettoyage`);
      if (temperatureTexture) {
        temperatureTexture.dispose();
      }
      if (overlayTexture) {
        overlayTexture.dispose();
      }
    };
  }, [temperatureTexture, overlayTexture, instanceId]);

  return (
    <group ref={groupRef} rotation-x={0.2} visible={isVisible}>
      <mesh ref={baseMeshRef} rotation-x={0.2}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshLambertMaterial
          key={`material-${instanceId}-${year}-${month}`}
          transparent
          color={0xffffff}
          emissive={0x333333}
          map={temperatureTexture}
        />
      </mesh>
      {overlayTexture && (
        <mesh rotation-x={0.2}>
          <sphereGeometry args={[1.001, 128, 64]} />
          <meshBasicMaterial
            key={`overlay-${instanceId}`}
            map={overlayTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.MultiplyBlending}
            alphaTest={0.1}
          />
        </mesh>
      )}
    </group>
  );
};

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

// Nouveau composant pour les contrôles mobiles
const MobileControls = ({ compareMode, setCompareMode, autoRotate, setAutoRotate }) => (
  <div style={{
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    background: 'rgba(34, 34, 34, 0.95)',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    border: '1px solid #444',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }}>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
    }}>
      <input 
        type="checkbox" 
        checked={compareMode} 
        onChange={e => setCompareMode(e.target.checked)} 
        style={{ accentColor: '#4a90e2' }} 
      />
      Comparaison
    </label>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
    }}>
      <input 
        type="checkbox" 
        checked={autoRotate} 
        onChange={e => setAutoRotate(e.target.checked)} 
        style={{ accentColor: '#4a90e2' }} 
      />
      Rotation
    </label>
  </div>
);

// Composant pour les contrôles desktop
const DesktopControls = ({ compareMode, setCompareMode, autoRotate, setAutoRotate }) => (
  <div style={{
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 10,
    background: '#222',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    color: '#fff'
  }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
      Mode comparaison
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
      Rotation automatique
    </label>
  </div>
);

// Nouveau composant pour les contrôles mobiles
const MobileControls = ({ compareMode, setCompareMode, autoRotate, setAutoRotate }) => (
  <div style={{
    position: 'fixed',
    bottom: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20,
    background: 'rgba(34, 34, 34, 0.95)',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    border: '1px solid #444',
    color: '#fff',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center'
  }}>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
    }}>
      <input 
        type="checkbox" 
        checked={compareMode} 
        onChange={e => setCompareMode(e.target.checked)} 
        style={{ accentColor: '#4a90e2' }} 
      />
      Comparaison
    </label>
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      fontSize: '0.9rem',
      whiteSpace: 'nowrap'
    }}>
      <input 
        type="checkbox" 
        checked={autoRotate} 
        onChange={e => setAutoRotate(e.target.checked)} 
        style={{ accentColor: '#4a90e2' }} 
      />
      Rotation
    </label>
  </div>
);

// Composant pour les contrôles desktop
const DesktopControls = ({ compareMode, setCompareMode, autoRotate, setAutoRotate }) => (
  <div style={{
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 10,
    background: '#222',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #444',
    color: '#fff'
  }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <input type="checkbox" checked={compareMode} onChange={e => setCompareMode(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
      Mode comparaison
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} style={{ accentColor: '#4a90e2' }} />
      Rotation automatique
    </label>
  </div>
);

export default function CanvasWithControlsOverlay({ availableDates }) {
  const isMobile = useIsMobile();
  const [autoRotate, setAutoRotate] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedYearA, setSelectedYearA] = useState(availableDates.current_year);
  const [selectedMonthA, setSelectedMonthA] = useState(availableDates.current_month);

  const fallbackYearB = availableDates.years.find(y => y !== availableDates.current_year) || availableDates.years[0];
  const [selectedYearB, setSelectedYearB] = useState(fallbackYearB);
  const [selectedMonthB, setSelectedMonthB] = useState('01');
  const [tempsA, setTempsA] = useState({ global: null, north: null, south: null });
  const [tempsB, setTempsB] = useState({ global: null, north: null, south: null });
  const globeRefA = useRef(null);
  const globeRefB = useRef(null);

  const displayTemps = (temps) => {
    return (
      <div style={{ fontSize: '0.85rem', marginTop: '1rem', color: '#ccc' }}>
        <p>🌍 Global: {temps.global !== null ? temps.global.toFixed(2) + '°C' : 'N/A'}</p>
        <p>🧊 Nord: {temps.north !== null ? temps.north.toFixed(2) + '°C' : 'N/A'}</p>
        <p>🏔️ Sud: {temps.south !== null ? temps.south.toFixed(2) + '°C' : 'N/A'}</p>
        <p>🌊 ONI: {typeof temps.oni === 'number' ? temps.oni.toFixed(2) : 'N/A'}</p>
      </div>
    );
  };

  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    setRenderKey(Date.now());
  }, [compareMode]);

  const renderCanvas = (year, month, onLoad, refKey, mode = 'solo') => (
    <Canvas
      key={`canvas-${mode}-${year}-${month}-${renderKey}`}
      camera={{ position: [0, 0, 2.5], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene>
          <Globe
            key={`globe-${mode}-${year}-${month}-${renderKey}`}
            year={year}
            month={month}
            isVisible={true}
            autoRotate={autoRotate}
            onLoad={onLoad}
            globeRef={refKey}
          />
        </Scene>
        <OrbitControls enableDamping dampingFactor={0.1} zoomSpeed={0.3} minDistance={2} maxDistance={5} enablePan={false} />
      </Suspense>
    </Canvas>
  );

  // Styles pour la sidebar en mode mobile
  const sidebarStyle = {
    minWidth: isMobile ? '100%' : '280px',
    maxWidth: isMobile ? '100%' : '320px',
    background: '#111',
    color: '#fff',
    padding: isMobile ? '0.75rem' : '1rem',
    boxShadow: isMobile ? '0 2px 10px rgba(0,0,0,0.3)' : '2px 0 10px rgba(0,0,0,0.3)',
    zIndex: 5,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    justifyContent: isMobile ? 'space-around' : 'space-around',
    gap: isMobile ? '1rem' : '0',
    maxHeight: isMobile ? '120px' : 'none'
  };

  // Styles pour les contrôles de période en mode mobile
  const periodControlStyle = {
    flex: isMobile ? '1' : 'none',
    minWidth: isMobile ? '140px' : 'auto'
  };

  const inputStyle = {
    width: '100%',
    marginBottom: '0.5rem',
    padding: isMobile ? '0.4rem' : '0.5rem',
    background: '#222',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    fontSize: isMobile ? '0.85rem' : '1rem'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: '100vh',
      width: '100%'
    }}>
      {/* SIDEBAR - Horizontal en mobile, vertical en desktop */}
      <div style={sidebarStyle}>
        <div style={periodControlStyle}>
          <h3 style={{ 
            marginBottom: '0.5rem', 
            fontSize: isMobile ? '0.9rem' : '1rem' 
          }}>📅 Période A</h3>
          <input 
            type="text" 
            value={selectedYearA} 
            onChange={e => setSelectedYearA(e.target.value)} 
            placeholder="Année" 
            style={inputStyle}
          />
          <input 
            type="text" 
            value={selectedMonthA} 
            onChange={e => setSelectedMonthA(e.target.value)} 
            placeholder="Mois" 
            style={{...inputStyle, marginBottom: 0}}
          />
          {!isMobile && displayTemps(tempsA)}
        </div>

        {compareMode && (
          <div style={periodControlStyle}>
            <h3 style={{ 
              marginBottom: '0.5rem', 
              fontSize: isMobile ? '0.9rem' : '1rem' 
            }}>📅 Période B</h3>
            <input 
              type="text" 
              value={selectedYearB} 
              onChange={e => setSelectedYearB(e.target.value)} 
              placeholder="Année" 
              style={inputStyle}
            />
            <input 
              type="text" 
              value={selectedMonthB} 
              onChange={e => setSelectedMonthB(e.target.value)} 
              placeholder="Mois" 
              style={{...inputStyle, marginBottom: 0}}
            />
            {!isMobile && displayTemps(tempsB)}
          </div>
        )}
      </div>

      {/* CANVAS AREA */}
      <div style={{
        flexGrow: 1,
        minWidth: isMobile ? '100%' : '400px',
        maxWidth: '100%',
        height: isMobile ? 'calc(100vh - 120px)' : '100vh',
        display: 'flex',
        flexDirection: isMobile && compareMode ? 'column' : 'row',
        position: 'relative',
      }}>
        {/* Contrôles selon le mode */}
        {isMobile ? (
          <MobileControls 
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
          />
        ) : (
          <DesktopControls 
            compareMode={compareMode}
            setCompareMode={setCompareMode}
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
          />
        )}

        {compareMode ? (
          <>
            <div style={{ 
              flex: 1, 
              height: isMobile ? '50%' : '100%',
              position: 'relative'
            }}>
              {isMobile && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  zIndex: 10,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  Période A
                </div>
              )}
              {renderCanvas(selectedYearA, selectedMonthA, setTempsA, globeRefA, 'compare-a')}
            </div>
            <div style={{ 
              flex: 1, 
              height: isMobile ? '50%' : '100%',
              position: 'relative'
            }}>
              {isMobile && (
                <div style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  zIndex: 10,
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}>
                  Période B
                </div>
              )}
              {renderCanvas(selectedYearB, selectedMonthB, setTempsB, globeRefB, 'compare-b')}
            </div>
          </>
        ) : (
          <Canvas 
            key={`solo-${selectedYearA}-${selectedMonthA}-${renderKey}`}
            camera={{ position: [0, 0, 2.5], fov: 75 }} 
            gl={{ antialias: true, alpha: true }} 
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <Scene>
                <Globe
                  key={`solo-globe-${selectedYearA}-${selectedMonthA}-${renderKey}`}
                  year={selectedYearA}
                  month={selectedMonthA}
                  isVisible={true}
                  autoRotate={autoRotate}
                  onLoad={setTempsA}
                  globeRef={globeRefA}
                />
              </Scene>
              <OrbitControls enableDamping dampingFactor={0.1} zoomSpeed={0.3} minDistance={2} maxDistance={5} enablePan={false} />
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* Affichage des températures en mobile en bas */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: '5rem',
          left: '0.5rem',
          right: '0.5rem',
          zIndex: 15,
          background: 'rgba(17, 17, 17, 0.95)',
          color: '#fff',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #444',
          backdropFilter: 'blur(10px)',
          fontSize: '0.8rem',
          display: 'flex',
          flexDirection: compareMode ? 'row' : 'column',
          gap: compareMode ? '1rem' : '0.5rem'
        }}>
          <div style={{ flex: 1 }}>
            <strong>Période A:</strong>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <span>🌍 {tempsA.global !== null ? tempsA.global.toFixed(1) + '°C' : 'N/A'}</span>
              <span>🧊 {tempsA.north !== null ? tempsA.north.toFixed(1) + '°C' : 'N/A'}</span>
              <span>🏔️ {tempsA.south !== null ? tempsA.south.toFixed(1) + '°C' : 'N/A'}</span>
            </div>
          </div>
          {compareMode && (
            <div style={{ flex: 1 }}>
              <strong>Période B:</strong>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                <span>🌍 {tempsB.global !== null ? tempsB.global.toFixed(1) + '°C' : 'N/A'}</span>
                <span>🧊 {tempsB.north !== null ? tempsB.north.toFixed(1) + '°C' : 'N/A'}</span>
                <span>🏔️ {tempsB.south !== null ? tempsB.south.toFixed(1) + '°C' : 'N/A'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}