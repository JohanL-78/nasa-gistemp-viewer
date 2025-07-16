'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Globe2, Thermometer, MousePointer, Palette, Database, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
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

const HelpSection = ({ icon: Icon, title, color, children }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '16px',
        border: `1px solid ${color}20`,
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <motion.div
          style={{
            background: `linear-gradient(135deg, ${color}60, ${color}40)`,
            borderRadius: '12px',
            padding: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          animate={{
            boxShadow: [
              `0 0 0px ${color}00`,
              `0 0 20px ${color}40`,
              `0 0 0px ${color}00`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={20} color={color} />
        </motion.div>
        <h3 style={{ 
          margin: 0, 
          fontSize: isMobile ? '16px' : '18px', 
          fontWeight: '600',
          color: color
        }}>
          {title}
        </h3>
      </div>
      <div style={{ 
        fontSize: isMobile ? '13px' : '14px', 
        lineHeight: '1.6', 
        color: '#ccc' 
      }}>
        {children}
      </div>
    </motion.div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => {
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '12px'
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${color}40, ${color}20)`,
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <h4 style={{ 
          margin: '0 0 4px 0', 
          fontSize: isMobile ? '13px' : '14px', 
          fontWeight: '600',
          color: color
        }}>
          {title}
        </h4>
        <p style={{ 
          margin: 0, 
          fontSize: isMobile ? '12px' : '13px', 
          color: '#bbb',
          lineHeight: '1.5'
        }}>
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default function HelpModal({ isOpen, onClose }) {
  const isMobile = useIsMobile();
  const { t } = useTranslation();

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
            background: 'rgba(0, 0, 0, 0.85)',
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
              border: '1px solid rgba(100, 181, 246, 0.3)',
              padding: isMobile ? '24px' : '32px',
              maxWidth: isMobile ? '95vw' : '700px',
              maxHeight: isMobile ? '90vh' : '85vh',
              width: '100%',
              color: '#fff',
              position: 'relative',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 20px rgba(100, 181, 246, 0.2)',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <motion.div
                  style={{
                    background: 'linear-gradient(135deg, #64b5f660, #64b5f640)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  animate={{
                    boxShadow: [
                      '0 0 0px #64b5f600',
                      '0 0 20px #64b5f660',
                      '0 0 0px #64b5f600'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Info size={24} color="#64b5f6" />
                </motion.div>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: '700' }}>
                    {t('help.title')}
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#bbb' }}>
                    {t('help.subtitle')}
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

            {/* Content */}
            <div style={{ fontSize: isMobile ? '13px' : '14px', lineHeight: '1.6' }}>
              
              {/* Navigation temporelle */}
              <HelpSection icon={Calendar} title={t('help.temporalNav.title')} color="#64b5f6">
                <p style={{ marginBottom: '12px' }}>
                  {t('help.temporalNav.description')}
                </p>
                <FeatureCard 
                  icon={Calendar}
                  title={t('help.temporalNav.yearSelection')}
                  description={t('help.temporalNav.yearDesc')}
                  color="#64b5f6"
                />
                <FeatureCard 
                  icon={Calendar}
                  title={t('help.temporalNav.monthSelection')}
                  description={t('help.temporalNav.monthDesc')}
                  color="#64b5f6"
                />
              </HelpSection>

              {/* Climate Data */}
              <HelpSection icon={Thermometer} title={t('help.climateData.title')} color="#ff6b6b">
                <p style={{ marginBottom: '12px' }}>
                  {t('help.climateData.description')}
                </p>
                <FeatureCard 
                  icon={Globe2}
                  title={t('help.climateData.global')}
                  description={t('help.climateData.globalDesc')}
                  color="#ff0080"
                />
                <FeatureCard 
                  icon={Thermometer}
                  title={t('help.climateData.north')}
                  description={t('help.climateData.northDesc')}
                  color="#00ff88"
                />
                <FeatureCard 
                  icon={Thermometer}
                  title={t('help.climateData.south')}
                  description={t('help.climateData.southDesc')}
                  color="#ff8c00"
                />
                <FeatureCard 
                  icon={Database}
                  title={t('help.climateData.oni')}
                  description={t('help.climateData.oniDesc')}
                  color="#00d4ff"
                />
              </HelpSection>

              {/* Globe interactif */}
              <HelpSection icon={Globe2} title={t('help.globe.title')} color="#00ff88">
                <FeatureCard 
                  icon={MousePointer}
                  title={t('help.globe.rotation')}
                  description={t('help.globe.rotationDesc')}
                  color="#00ff88"
                />
                <FeatureCard 
                  icon={MousePointer}
                  title={t('help.globe.zoom')}
                  description={t('help.globe.zoomDesc')}
                  color="#00ff88"
                />
                <FeatureCard 
                  icon={Globe2}
                  title={t('help.globe.autoRotation')}
                  description={t('help.globe.autoRotationDesc')}
                  color="#00ff88"
                />
              </HelpSection>

              {/* Échelle des couleurs */}
              <HelpSection icon={Palette} title={t('help.colorScale.title')} color="#ff8c00">
                <p style={{ marginBottom: '12px' }}>
                  {t('help.colorScale.description')}
                </p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#6bb6ff', fontWeight: '600' }}>{t('help.colorScale.cold')}</span>
                  <div style={{
                    flex: 1,
                    height: '12px',
                    background: 'linear-gradient(to right, #0066cc 0%, #3399ff 20%, #66ccff 40%, #ffffff 50%, #ffcc66 60%, #ff9933 80%, #cc3300 100%)',
                    borderRadius: '6px'
                  }} />
                  <span style={{ color: '#ff6666', fontWeight: '600' }}>{t('help.colorScale.hot')}</span>
                </div>
                <p style={{ fontSize: isMobile ? '12px' : '13px', color: '#bbb' }}>
                  {t('help.colorScale.explanation')}
                </p>
              </HelpSection>

              {/* Table de données */}
              <HelpSection icon={Database} title={t('help.dataTable.title')} color="#ffc107">
                <p style={{ marginBottom: '12px' }}>
                  {t('help.dataTable.description')}
                </p>
                <FeatureCard 
                  icon={Database}
                  title={t('help.dataTable.regionSelection')}
                  description={t('help.dataTable.regionDesc')}
                  color="#ffc107"
                />
                <FeatureCard 
                  icon={MousePointer}
                  title={t('help.dataTable.columnSort')}
                  description={t('help.dataTable.columnSortDesc')}
                  color="#ffc107"
                />
                <FeatureCard 
                  icon={Palette}
                  title={t('help.dataTable.colorCode')}
                  description={t('help.dataTable.colorCodeDesc')}
                  color="#ffc107"
                />
                <p style={{ 
                  fontSize: isMobile ? '12px' : '13px', 
                  color: '#bbb',
                  fontStyle: 'italic',
                  marginTop: '12px'
                }}>
                  {t('help.dataTable.tip')}
                </p>
              </HelpSection>

              {/* Sources */}
              <HelpSection icon={ExternalLink} title={t('help.sources.title')} color="#9c27b0">
                <FeatureCard 
                  icon={Database}
                  title={t('help.sources.nasa')}
                  description={t('help.sources.nasaDesc')}
                  color="#9c27b0"
                />
                <FeatureCard 
                  icon={Database}
                  title={t('help.sources.noaa')}
                  description={t('help.sources.noaaDesc')}
                  color="#9c27b0"
                />
                <p style={{ 
                  fontSize: isMobile ? '12px' : '13px', 
                  color: '#888',
                  fontStyle: 'italic',
                  marginTop: '12px'
                }}>
                  {t('help.sources.note')}
                </p>
              </HelpSection>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.1), rgba(100, 181, 246, 0.05))',
                  borderRadius: '12px',
                  border: '1px solid rgba(100, 181, 246, 0.2)',
                  marginTop: '20px'
                }}
              >
               
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}