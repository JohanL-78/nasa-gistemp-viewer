'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe2, Thermometer, Snowflake, Mountain, Waves, Settings } from 'lucide-react';
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

const ModernInput = ({ value, onChange, placeholder, icon: Icon }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      className="input-container"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
        marginBottom: isMobile ? '6px' : '1rem'
      }}
    >
      <div style={{
        position: 'absolute',
        left: isMobile ? '8px' : '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 2,
        color: '#64b5f6'
      }}>
        <Icon size={isMobile ? 14 : 18} />
      </div>
      <input 
        type="text" 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: isMobile ? '8px 8px 8px 30px' : '12px 12px 12px 45px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: isMobile ? '8px' : '12px',
          color: '#fff',
          fontSize: isMobile ? '12px' : '14px',
          outline: 'none',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
        }}
        onFocus={(e) => {
          e.target.style.border = '1px solid rgba(100, 181, 246, 0.5)';
          e.target.style.boxShadow = '0 0 20px rgba(100, 181, 246, 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }}
      />
    </motion.div>
  );
};

const DataCard = ({ icon: Icon, label, value, color }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)`,
        backdropFilter: 'blur(15px)',
        border: `1px solid ${color}40`,
        borderRadius: isMobile ? '8px' : '16px',
        padding: isMobile ? '6px' : '16px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: isMobile ? '4px' : '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 20px ${color}10`,
        minHeight: isMobile ? '60px' : 'auto'
      }}
    >
      <motion.div 
        style={{
          background: `linear-gradient(135deg, ${color}60, ${color}40)`,
          borderRadius: isMobile ? '6px' : '12px',
          padding: isMobile ? '4px' : '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0
        }}
        whileHover={{
          boxShadow: `0 0 30px ${color}60, 0 0 60px ${color}30`,
          scale: 1.1
        }}
        initial={{ boxShadow: `0 0 0px ${color}00` }}
        animate={{ 
          boxShadow: [
            `0 0 0px ${color}00`,
            `0 0 20px ${color}40`,
            `0 0 0px ${color}00`
          ]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: Math.random() * 2
        }}
      >
        <Icon size={isMobile ? 12 : 20} color={color} />
      </motion.div>
      <div style={{ 
        flex: 1, 
        textAlign: isMobile ? 'center' : 'left',
        minWidth: 0
      }}>
        <div style={{ 
          fontSize: isMobile ? '8px' : '12px', 
          color: '#bbb', 
          marginBottom: '1px', 
          fontWeight: '500',
          whiteSpace: isMobile ? 'nowrap' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </div>
        <div style={{ 
          fontSize: isMobile ? '11px' : '18px', 
          fontWeight: '700', 
          color: color, 
          textShadow: `0 0 10px ${color}50`,
          whiteSpace: 'nowrap'
        }}>
          {value !== null ? `${value?.toFixed(2)}°C` : 'N/A'}
        </div>
      </div>
    </motion.div>
  );
};

const Globe = ({ year, month, isVisible, autoRotate, onLoad, globeRef }) => {
  const groupRef = useRef();
  const baseMeshRef = useRef();
  const [temperatureTexture, setTemperatureTexture] = useState(null);
  const [overlayTexture, setOverlayTexture] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedKey, setLastLoadedKey] = useState('');
  const instanceId = useRef(Math.random().toString(36).slice(2, 11)).current;

  useFrame(() => {
    if (autoRotate && groupRef.current) groupRef.current.rotation.y += 0.0016;
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
    <group ref={groupRef} rotation-x={0.2} visible={isVisible} position={[0, 0.3, 0]}>
      <mesh ref={baseMeshRef} rotation-x={0.2}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshBasicMaterial map={temperatureTexture} transparent={true} toneMapped={false} />
      </mesh>
      {overlayTexture && (
        <mesh rotation-x={0.2}>
          <sphereGeometry args={[1.001, 128, 64]} />
          <meshBasicMaterial map={overlayTexture} transparent opacity={0.43} depthWrite={false} blending={THREE.MultiplyBlending} alphaTest={0.1} />
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

  const sidebarVariants = {
    hidden: {
      x: isMobile ? 0 : -300,
      y: isMobile ? -300 : 0,
      opacity: 0
    },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
        duration: 0.6
      }
    }
  };

  const overlayVariants = {
    hidden: { x: 400, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 200
      }
    }
  };

  const overlayStyle = {
    position: 'absolute',
    top: '2.3rem',
    right: '4.5rem',
    transform: 'translateY(-50%)',
    zIndex: 10,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(20px)',
    padding: '16px 20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    maxWidth: isMobile ? 'calc(100% - 5rem)' : '280px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      height: '85vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)'
    }}>
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: isMobile ? '100%' : '320px',
          height: isMobile ? 'auto' : '85vh',
          maxHeight: isMobile ? '40vh' : '85vh',
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          borderBottom: isMobile ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          color: '#fff',
          padding: isMobile ? '12px' : '24px',
          boxShadow: isMobile ? '0 4px 25px rgba(0,0,0,0.3)' : '4px 0 25px rgba(0,0,0,0.3)',
          zIndex: isMobile ? 15 : 5,
          position: isMobile ? 'relative' : 'static',
          overflow: 'visible',
          display: 'flex',
          flexDirection: isMobile ? 'row' : 'column',
          gap: isMobile ? '12px' : '24px'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ flex: isMobile ? '1' : 'none' }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: isMobile ? '8px' : '24px',
            padding: isMobile ? '8px' : '16px',
            background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.15), rgba(100, 181, 246, 0.08))',
            borderRadius: '12px',
            border: '1px solid rgba(100, 181, 246, 0.3)'
          }}>
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0px #64b5f600',
                  '0 0 20px #64b5f650',
                  '0 0 0px #64b5f600'
                ]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Calendar size={isMobile ? 16 : 24} color="#64b5f6" />
            </motion.div>
            <h3 style={{ 
              margin: 0, 
              fontSize: isMobile ? '14px' : '18px', 
              fontWeight: '600',
              background: 'linear-gradient(135deg, #64b5f6, #42a5f5)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {isMobile ? 'Période' : 'Période de Données'}
            </h3>
          </div>

          <ModernInput 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            placeholder="Année" 
            icon={Calendar}
          />
          <ModernInput 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            placeholder="Mois" 
            icon={Calendar}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
            borderRadius: '16px',
            padding: isMobile ? '8px' : '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            flex: isMobile ? '2' : 'none'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: isMobile ? '8px' : '16px'
          }}>
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0px #ff6b6b00',
                  '0 0 25px #ff6b6b60',
                  '0 0 0px #ff6b6b00'
                ]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <Thermometer size={isMobile ? 14 : 20} color="#ff6b6b" />
            </motion.div>
            <h4 style={{ 
              margin: 0, 
              fontSize: isMobile ? '12px' : '16px', 
              fontWeight: '600',
              color: '#fff'
            }}>
              {isMobile ? 'Données' : 'Données Climatiques'}
            </h4>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr',
            gap: isMobile ? '6px' : '12px'
          }}>
            <DataCard 
              icon={Globe2} 
              label="Global" 
              value={temps.global} 
              color="#00d4ff"
            />
            
            <DataCard 
              icon={Snowflake} 
              label="Nord" 
              value={temps.north} 
              color="#00ff88"
            />
            
            <DataCard 
              icon={Mountain} 
              label="Sud" 
              value={temps.south} 
              color="#ff8c00"
            />
            
            <DataCard 
              icon={Waves} 
              label="ONI" 
              value={temps.oni} 
              color="#ff0080"
            />
          </div>
        </motion.div>
      </motion.div>

      <div style={{
        flexGrow: 1,
        minWidth: 0,
        maxWidth: '100%',
        height: isMobile ? 'auto' : '100vh',
        minHeight: isMobile ? '50vh' : '100vh',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.button 
          onClick={() => setControlsOpen((o) => !o)} 
          aria-label="Ouvrir les commandes"
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              '0 8px 25px rgba(0, 0, 0, 0.3)',
              '0 8px 25px rgba(0, 0, 0, 0.3), 0 0 30px rgba(100, 181, 246, 0.4)',
              '0 8px 25px rgba(0, 0, 0, 0.3)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            right: '1rem',
            top: '2rem',
            zIndex: 11,
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(26, 26, 46, 0.8))',
            backdropFilter: 'blur(20px)',
            color: '#64b5f6',
            borderRadius: '50%',
            border: '1px solid rgba(100, 181, 246, 0.3)',
            outline: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 0px #64b5f600)',
                'drop-shadow(0 0 8px #64b5f680)',
                'drop-shadow(0 0 0px #64b5f600)'
              ]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          >
            <Settings size={20} />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {controlsOpen && (
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={overlayStyle}
            >
              <motion.label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input 
                  type="checkbox" 
                  checked={autoRotate} 
                  onChange={(e) => setAutoRotate(e.target.checked)} 
                  style={{ 
                    accentColor: '#64b5f6',
                    width: '18px',
                    height: '18px'
                  }} 
                />
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  Rotation automatique
                </span>
              </motion.label>
            </motion.div>
          )}
        </AnimatePresence>

        <Canvas 
          key={`${year}-${month}`} 
          camera={{ position: [0, 0, 2.5], fov: 75 }} 
          gl={{ antialias: true, alpha: true }} 
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <Scene>
              <Globe 
                year={year} 
                month={month} 
                isVisible={true} 
                autoRotate={autoRotate} 
                onLoad={setTemps} 
                globeRef={globeRef} 
              />
            </Scene>
            <OrbitControls 
              enableDamping 
              dampingFactor={0.1} 
              zoomSpeed={0.3} 
              minDistance={2} 
              maxDistance={5} 
              enablePan={false} 
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}