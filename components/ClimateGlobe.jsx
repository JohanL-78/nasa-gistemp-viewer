'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Globe2, Thermometer, Snowflake, Mountain, Waves, Settings, X, Info, ExternalLink, BarChart3 } from 'lucide-react';
import * as THREE from 'three';
import { getTemperatureDataAction } from '@/lib/actions';
import TemperatureChart from './TemperatureChart';
import { useTranslation } from '@/hooks/useTranslation';

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
          fontSize: isMobile ? '16px' : '14px', // 16px sur mobile pour éviter le zoom iOS
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

const DetailModal = ({ isOpen, onClose, data, type, year, month }) => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const getModalContent = () => {
    switch (type) {
      case 'global':
        return {
          title: t('globe.modals.global.title'),
          icon: Globe2,
          color: '#ff0080',
          value: data?.global,
          description: t('globe.modals.global.description'),
          details: `${data?.global > 0 ? '+' : ''}${data?.global?.toFixed(2)}°C ${t('globe.modals.global.details')}`,
          source: t('globe.modals.global.source'),
          sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
          explanation: t('globe.modals.global.explanation')
        };
      case 'north':
        return {
          title: t('globe.modals.north.title'),
          icon: Snowflake,
          color: '#00ff88',
          value: data?.north,
          description: t('globe.modals.north.description'),
          details: `${data?.north > 0 ? '+' : ''}${data?.north?.toFixed(2)}°C ${t('globe.modals.north.details')}`,
          source: t('globe.modals.north.source'),
          sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
          explanation: t('globe.modals.north.explanation')
        };
      case 'south':
        return {
          title: t('globe.modals.south.title'),
          icon: Mountain,
          color: '#ff8c00',
          value: data?.south,
          description: t('globe.modals.south.description'),
          details: `${data?.south > 0 ? '+' : ''}${data?.south?.toFixed(2)}°C ${t('globe.modals.south.details')}`,
          source: t('globe.modals.south.source'),
          sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
          explanation: t('globe.modals.south.explanation')
        };
      case 'oni':
        return {
          title: t('globe.modals.oni.title'),
          icon: Waves,
          color: '#00d4ff',
          value: data?.oni,
          description: t('globe.modals.oni.description'),
          details: `${data?.oni > 0 ? '+' : ''}${data?.oni?.toFixed(2)}°C ${t('globe.modals.oni.details')}`,
          source: t('globe.modals.oni.source'),
          sourceUrl: 'https://www.cpc.ncep.noaa.gov/data/indices/',
          explanation: t('globe.modals.oni.explanation')
        };
      default:
        return null;
    }
  };

  const content = getModalContent();
  if (!content) return null;

  const Icon = content.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? '20px' : '40px'
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: `1px solid ${content.color}40`,
              padding: isMobile ? '24px' : '32px',
              maxWidth: isMobile ? '90vw' : '500px',
              width: '100%',
              color: '#fff',
              position: 'relative',
              boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px ${content.color}20`
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div
                  style={{
                    background: `linear-gradient(135deg, ${content.color}60, ${content.color}40)`,
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 0px ${content.color}00`,
                      `0 0 20px ${content.color}60`,
                      `0 0 0px ${content.color}00`
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Icon size={24} color={content.color} />
                </motion.div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                    {content.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#bbb' }}>
                    {month}/{year}
                  </p>
                </div>
              </div>
              
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Value */}
            <div style={{
              textAlign: 'center',
              marginBottom: '24px',
              padding: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: '700',
                color: content.color,
                textShadow: `0 0 20px ${content.color}50`,
                marginBottom: '8px'
              }}>
                {content.value !== null ? `${content.value?.toFixed(2)}°C` : 'N/A'}
              </div>
              <div style={{
                fontSize: '16px',
                color: '#bbb',
                marginBottom: '12px'
              }}>
                {content.description}
              </div>
              <div style={{
                fontSize: '14px',
                color: content.color,
                fontWeight: '600'
              }}>
                {content.details}
              </div>
            </div>

            {/* Explanation */}
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Info size={16} color={content.color} />
                <span style={{ fontSize: '14px', fontWeight: '600', color: content.color }}>
                  {t('globe.modals.explanation') || 'Explanation'}
                </span>
              </div>
              <p style={{
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#ccc',
                margin: 0
              }}>
                {content.explanation}
              </p>
            </div>

            {/* Source */}
            <motion.a
              href={content.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: `linear-gradient(135deg, ${content.color}15, ${content.color}08)`,
                border: `1px solid ${content.color}30`,
                borderRadius: '12px',
                color: content.color,
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <span>Source: {content.source}</span>
              <ExternalLink size={16} />
            </motion.a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TemperatureScale = () => {
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
       style={{
        position: 'absolute',
        bottom: isMobile ? '10px' : '20px',
        left: isMobile ? '10px' : '50%',
        right: isMobile ? '10px' : 'auto',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(15px)',
        padding: isMobile ? '8px 12px' : '12px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontSize: isMobile ? '10px' : '12px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        maxWidth: isMobile ? 'calc(100vw - 20px)' : '400px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '6px' : '12px'
      }}>
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0px #64b5f600',
              '0 0 15px #64b5f660',
              '0 0 0px #64b5f600'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Thermometer size={isMobile ? 12 : 16} color="#64b5f6" />
        </motion.div>
        
        <span style={{ fontWeight: '600', marginRight: isMobile ? '4px' : '8px' }}>
          {t('globe.temperatureScale.title') || 'Temperature anomalies'}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px' }}>
          <span style={{ color: '#6bb6ff', fontSize: isMobile ? '9px' : '11px' }}>-5°C</span>
          
          <div style={{
            width: isMobile ? '80px' : '120px',
            height: isMobile ? '8px' : '12px',
            background: 'linear-gradient(to right, #0066cc 0%, #3399ff 20%, #66ccff 40%, #ffffff 50%, #ffcc66 60%, #ff9933 80%, #cc3300 100%)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
          }}>
            {/* Marqueur pour 0°C */}
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '2px',
              height: isMobile ? '12px' : '16px',
              background: '#fff',
              borderRadius: '1px',
              boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)'
            }} />
          </div>
          
          <span style={{ color: '#ff6666', fontSize: isMobile ? '9px' : '11px' }}>+5°C</span>
        </div>
      </div>
    </motion.div>
  );
};

const DataCard = ({ icon: Icon, label, value, color, onClick, isLoading }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      whileHover={{ scale: isLoading ? 1 : 1.05, y: isLoading ? 0 : -2 }}
      whileTap={{ scale: isLoading ? 1 : 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={isLoading ? undefined : onClick}
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
        cursor: isLoading ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 20px ${color}10`,
        minHeight: isMobile ? '60px' : 'auto',
        position: 'relative',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {/* Petit indicateur pour montrer que c'est cliquable - seulement si pas en loading */}
      {!isLoading && (
        <motion.div
          style={{
            position: 'absolute',
            top: isMobile ? '4px' : '8px',
            right: isMobile ? '4px' : '8px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: color,
            opacity: 0.6
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      
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
        whileHover={isLoading ? {} : {
          boxShadow: `0 0 30px ${color}60, 0 0 60px ${color}30`,
          scale: 1.1
        }}
        initial={{ boxShadow: `0 0 0px ${color}00` }}
        animate={isLoading ? {} : { 
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
          {isLoading ? (
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ...
            </motion.span>
          ) : (
            value !== null && value !== undefined ? `${value?.toFixed(2)}°C` : 'N/A'
          )}
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
  // On ne skip plus parce que baseMeshRef n'est pas encore monté
  if (isLoading || lastLoadedKey === key) return;
  setIsLoading(true);

  const loader = new THREE.TextureLoader();
  const timestamp = Date.now();
  const url = `/textures/gistemp_${key}.png?i=${instanceId}&time=${timestamp}`;

  // success
  loader.load(
    url,
    (tex) => {
      // initialisation générique du texture
      tex.colorSpace   = THREE.SRGBColorSpace;
      tex.magFilter    = THREE.LinearFilter;
      tex.minFilter    = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS        = THREE.ClampToEdgeWrapping;
      tex.wrapT        = THREE.ClampToEdgeWrapping;
      tex.flipY        = true;
      tex.needsUpdate  = true;
      tex.uuid         = THREE.MathUtils.generateUUID();

      setTemperatureTexture(tex);

      // on ne touche au material que si le mesh existe
      if (baseMeshRef.current) {
        const mat = baseMeshRef.current.material;
        if (mat.map) mat.map.dispose();
        mat.map       = tex;
        mat.needsUpdate = true;
        mat.uuid      = THREE.MathUtils.generateUUID();
      }

      setLastLoadedKey(key);
      setIsLoading(false);
    },
    undefined,
    // error → fallback
    () => {
      loader.load(
        `/textures/default_earth.jpg?i=${instanceId}&time=${timestamp}`,
        (tex) => {
          tex.colorSpace   = THREE.SRGBColorSpace;
          tex.magFilter    = THREE.LinearFilter;
          tex.minFilter    = THREE.LinearFilter;
          tex.generateMipmaps = false;
          tex.wrapS        = THREE.ClampToEdgeWrapping;
          tex.wrapT        = THREE.ClampToEdgeWrapping;
          tex.flipY        = true;
          tex.needsUpdate  = true;
          tex.uuid         = THREE.MathUtils.generateUUID();

          setTemperatureTexture(tex);

          if (baseMeshRef.current) {
            const mat = baseMeshRef.current.material;
            if (mat.map) mat.map.dispose();
            mat.map       = tex;
            mat.needsUpdate = true;
            mat.uuid      = THREE.MathUtils.generateUUID();
          }

          setLastLoadedKey(key);
          setIsLoading(false);
        }
      );
    }
  );

  if (onLoad && lastLoadedKey !== key) {
    getTemperatureDataAction(year, month)
      .then(res => onLoad(res ?? {}))
      .catch(() => setIsLoading(false));
  }
}, [year, month, onLoad, lastLoadedKey, isLoading, instanceId]);


  useEffect(() => {
    if (overlayTexture) return;
    const loader = new THREE.TextureLoader();
    const timestamp = Date.now();
    loader.load(`/textures/overlay.png?i=${instanceId}&time=${timestamp}`, (tex) => {
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
  const { t } = useTranslation();
  const [autoRotate, setAutoRotate] = useState(true);
  const [controlsOpen, setControlsOpen] = useState(true);
  const [year, setYear] = useState(availableDates.current_year);
  const [month, setMonth] = useState(availableDates.current_month);
  const [temps, setTemps] = useState({});
  const [isLoadingTemps, setIsLoadingTemps] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [chartOpen, setChartOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const globeRef = useRef(null);

  // Effet pour charger les données initiales
  useEffect(() => {
    setIsLoadingTemps(true);
  }, []);

  // Charger les données du tableau pour le graphique
  useEffect(() => {
    const loadTableData = async () => {
      try {
        const response = await fetch('/api/table?source=global&reference=nasa');
        const data = await response.json();
        setTableData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau:', error);
      }
    };
    loadTableData();
  }, []);

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

  const handleCardClick = (type) => {
    // Empêcher l'ouverture de la modale si les données ne sont pas encore chargées
    if (isLoadingTemps || !temps || Object.keys(temps).length === 0) {
      return;
    }
    setModalType(type);
    setModalOpen(true);
  };

  const handleTempsLoad = (newTemps) => {
    setTemps(newTemps || {});
    setIsLoadingTemps(false);
  };

  // Réinitialiser le loading quand on change de date
  const handleYearChange = (e) => {
    setYear(e.target.value);
    setIsLoadingTemps(true);
  };

  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    setIsLoadingTemps(true);
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
      height: '90vh', 
      width: '100%',
      background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)'
    }}>
      <motion.div
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        style={{
          width: isMobile ? '100%' : '320px',
          height: isMobile ? 'auto' : '90vh',
          maxHeight: isMobile ? '40vh' : '90vh',
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
              {isMobile ? t('globe.sections.dataPeriodShort') : t('globe.sections.dataPeriod')}
            </h3>
          </div>

          <ModernInput 
            value={year} 
            onChange={handleYearChange} 
            placeholder={t('globe.inputs.yearPlaceholder')} 
            icon={Calendar}
          />
          <ModernInput 
            value={month} 
            onChange={handleMonthChange} 
            placeholder={t('globe.inputs.monthPlaceholder')} 
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
              color: '#fff',
              flex: 1
            }}>
              {isMobile ? (t('globe.sections.dataShort') || 'Data') : (t('globe.sections.climateData') || 'Climate Data')}
            </h4>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setChartOpen(true)}
            animate={{
              boxShadow: [
                '0 2px 8px rgba(100, 181, 246, 0.2)',
                '0 4px 16px rgba(100, 181, 246, 0.4)',
                '0 2px 8px rgba(100, 181, 246, 0.2)'
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.3))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(100, 181, 246, 0.4)',
              borderRadius: '12px',
              padding: isMobile ? '6px 10px' : '8px 12px',
              color: '#64b5f6',
              fontSize: isMobile ? '10px' : '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontWeight: '600',
              width: '100%',
              marginBottom: isMobile ? '8px' : '12px',
              transition: 'all 0.3s ease'
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <BarChart3 size={isMobile ? 12 : 14} />
            </motion.div>
            {isMobile ? (t('globe.controls.showChart') || 'Chart') : (t('globe.controls.showChart') || 'Show Chart')}
          </motion.button>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr',
            gap: isMobile ? '6px' : '12px'
          }}>
            <DataCard 
              icon={Globe2} 
              label={t('globe.labels.global')} 
              value={isLoadingTemps ? null : temps.global} 
              color="#ff0080"
              onClick={() => handleCardClick('global')}
              isLoading={isLoadingTemps}
            />
            
            <DataCard 
              icon={Snowflake} 
              label={t('globe.labels.north')} 
              value={isLoadingTemps ? null : temps.north} 
              color="#00ff88"
              onClick={() => handleCardClick('north')}
              isLoading={isLoadingTemps}
            />
            
            <DataCard 
              icon={Mountain} 
              label={t('globe.labels.south')} 
              value={isLoadingTemps ? null : temps.south} 
              color="#ff8c00"
              onClick={() => handleCardClick('south')}
              isLoading={isLoadingTemps}
            />
            
            <DataCard 
              icon={Waves} 
              label={t('globe.labels.oni')} 
              value={isLoadingTemps ? null : temps.oni} 
              color="#00d4ff"
              onClick={() => handleCardClick('oni')}
              isLoading={isLoadingTemps}
            />
          </div>
        </motion.div>
      </motion.div>

      <div style={{
        flexGrow: 1,
        minWidth: 0,
        maxWidth: '100%',
        height: isMobile ? 'auto' : '90vh',
        minHeight: isMobile ? '50vh' : '90vh',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.button 
          onClick={() => setControlsOpen((o) => !o)} 
          aria-label={t('globe.controls.openControls')}
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
                  {t('globe.controls.autoRotation') || 'Auto rotation'}
                </span>
              </motion.label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barre d'anomalies de température */}
        <TemperatureScale />

        <Canvas 
          key={`${year}-${month}`} 
          camera={{ 
            position: [0, 0, isMobile ? 3.5 : 2.5], // Caméra plus éloignée sur mobile
            fov: 75 
          }} 
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
                onLoad={handleTempsLoad} 
                globeRef={globeRef} 
              />
            </Scene>
            <OrbitControls 
              enableDamping 
              dampingFactor={0.1} 
              zoomSpeed={0.3} 
              minDistance={isMobile ? 2.5 : 2} 
              maxDistance={isMobile ? 6 : 5} 
              enablePan={false} 
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Modale de détails */}
      <DetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        data={temps}
        type={modalType}
        year={year}
        month={month}
      />

      {/* Graphique des anomalies */}
      <TemperatureChart
        isOpen={chartOpen}
        onClose={() => setChartOpen(false)}
        tableData={tableData}
        currentMonth={parseInt(month)}
        translations={{
          monthly: t('chart.controls.monthly') || "Monthly",
          annual: t('chart.controls.annual') || "Annual",
          annualAnomalies: t('chart.titles.annualAnomalies') || "Annual Anomalies",
          monthlyAnomalies: t('chart.titles.monthlyAnomalies') || "Anomalies for",
          global: t('chart.regions.global') || "Global",
          north: t('chart.regions.north') || "Northern Hemisphere",
          south: t('chart.regions.south') || "Southern Hemisphere",
          currentYearHighlight: t('chart.footer.currentYearHighlight') || "Current year",
          highlighted: t('chart.footer.highlighted') || "highlighted",
          chartFrom: t('chart.footer.chartFrom') || "Chart from",
          krakatoa: t('chart.events.krakatoa') || "Krakatoa Eruption",
          pinatubo: t('chart.events.pinatubo') || "Mount Pinatubo Eruption",
          elNinoIntense: t('chart.events.elNinoIntense') || "Intense El Niño",
          elNinoRecord: t('chart.events.elNinoRecord') || "Record El Niño",
          export: t('chart.ui.export') || "Export",
          currentYearCalculated: t('chart.ui.currentYearCalculated') || "Current year calculated",
          annualData: t('chart.ui.annualData') || "Annual data",
          monthlyData: t('chart.ui.monthlyData') || "Monthly data",
          loadingData: t('chart.ui.loadingData') || "Loading data...",
          referenceNasa: t('chart.ui.referenceNasa') || "1951-1980 (NASA)",
          referencePreindustrial: t('chart.ui.referencePreindustrial') || "1880-1899 (Pre-industrial)",
          referenceModern: t('chart.ui.referenceModern') || "1991-2020 (Modern)",
          trendPerDecade: t('chart.ui.trendPerDecade') || "Trend/decade",
          monthNames: t('chart.ui.monthNames') || {
            1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
            7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
          },
          currentYearTooltip: t('chart.tooltip.currentYear') || "(Current year)"
        }}
      />
    </div>
  );
}