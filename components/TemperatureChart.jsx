'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Calendar, BarChart3, Download, Settings } from 'lucide-react';
import html2canvas from 'html2canvas';

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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#fff',
          fontSize: '13px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#64b5f6' }}>
          {label} {data.isCurrentYear && <span style={{ color: '#ffc107', fontSize: '11px' }}>(Année courante)</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: payload[0].color,
            border: data.isCurrentYear ? '2px solid #ffc107' : 'none'
          }} />
          <span>{payload[0].value !== null ? `${payload[0].value.toFixed(2)}°C` : 'N/A'}</span>
        </div>
        {data.isCurrentYear && (
          <div style={{ 
            fontSize: '11px', 
            color: '#ffc107', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {data.isCalculated 
              ? `Moyenne calculée sur ${data.monthsUsed} mois disponibles`
              : 'Données annuelles provisoires (année en cours)'
            }
          </div>
        )}
        {data.notable && (
          <div style={{ 
            fontSize: '11px', 
            color: '#ffc107', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {data.notable}
          </div>
        )}
      </motion.div>
    );
  }
  return null;
};

const ChartControls = ({ month, onMonthChange, reference, onReferenceChange, source, onSourceChange, viewType, onViewTypeChange, onExport, translations }) => {
  const isMobile = useIsMobile();

  const months = [
    { value: 1, name: translations?.monthNames?.[1] || 'January' }, 
    { value: 2, name: translations?.monthNames?.[2] || 'February' }, 
    { value: 3, name: translations?.monthNames?.[3] || 'March' },
    { value: 4, name: translations?.monthNames?.[4] || 'April' }, 
    { value: 5, name: translations?.monthNames?.[5] || 'May' }, 
    { value: 6, name: translations?.monthNames?.[6] || 'June' },
    { value: 7, name: translations?.monthNames?.[7] || 'July' }, 
    { value: 8, name: translations?.monthNames?.[8] || 'August' }, 
    { value: 9, name: translations?.monthNames?.[9] || 'September' },
    { value: 10, name: translations?.monthNames?.[10] || 'October' }, 
    { value: 11, name: translations?.monthNames?.[11] || 'November' }, 
    { value: 12, name: translations?.monthNames?.[12] || 'December' }
  ];

  const references = [
    { value: 'nasa', name: translations?.referenceNasa || '1951-1980 (NASA)' },
    { value: 'preindustrial', name: translations?.referencePreindustrial || '1880-1899 (Pre-industrial)' },
    { value: 'modern', name: translations?.referenceModern || '1991-2020 (Modern)' }
  ];

  const sources = [
    { value: 'global', name: translations?.global || 'Global' },
    { value: 'north', name: translations?.north || 'Northern Hemisphere' },
    { value: 'south', name: translations?.south || 'Southern Hemisphere' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: isMobile ? '8px' : '16px',
      marginBottom: '20px',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={16} color="#64b5f6" />
        <select
          value={viewType}
          onChange={(e) => onViewTypeChange(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          <option value="monthly" style={{ background: '#1a1a2e', color: '#fff' }}>{translations?.monthly || 'Monthly'}</option>
          <option value="annual" style={{ background: '#1a1a2e', color: '#fff' }}>{translations?.annual || 'Annual'}</option>
        </select>
      </div>

      {viewType === 'monthly' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={16} color="#64b5f6" />
          <select
            value={month}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none'
            }}
          >
            {months.map(m => (
              <option key={m.value} value={m.value} style={{ background: '#1a1a2e', color: '#fff' }}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={16} color="#ff6b6b" />
        <select
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          {sources.map(s => (
            <option key={s.value} value={s.value} style={{ background: '#1a1a2e', color: '#fff' }}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Settings size={16} color="#00ff88" />
        <select
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            color: '#fff',
            fontSize: '13px',
            outline: 'none'
          }}
        >
          {references.map(r => (
            <option key={r.value} value={r.value} style={{ background: '#1a1a2e', color: '#fff' }}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onExport}
        style={{
          background: 'linear-gradient(135deg, #64b5f6, #42a5f5)',
          border: 'none',
          borderRadius: '8px',
          padding: '6px 12px',
          color: '#fff',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontWeight: '500'
        }}
      >
        <Download size={14} />
        {translations?.export || 'Export'}
      </motion.button>
    </div>
  );
};

// Composant tooltip avec traductions passées en props
const SimpleTooltip = ({ active, payload, label, currentYearText }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '12px 16px',
          color: '#fff',
          fontSize: '13px',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '4px', color: '#64b5f6' }}>
          {label} {data.isCurrentYear && <span style={{ color: '#ffc107', fontSize: '11px' }}>{currentYearText}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: payload[0].color,
            border: data.isCurrentYear ? '2px solid #ffc107' : 'none'
          }} />
          <span>{payload[0].value !== null ? `${payload[0].value.toFixed(2)}°C` : 'N/A'}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TemperatureChart({ isOpen, onClose, tableData, currentMonth, translations }) {
  const isMobile = useIsMobile();
  const [month, setMonth] = useState(currentMonth || 1);
  
  const [reference, setReference] = useState('nasa');
  const [source, setSource] = useState('global');
  const [viewType, setViewType] = useState('monthly'); // 'monthly' ou 'annual'
  const [currentTableData, setCurrentTableData] = useState(tableData || []);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  // Effet pour recharger les données quand on change de source ou de période de référence
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/table?source=${source}&reference=${reference}`);
        const data = await response.json();
        setCurrentTableData(data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [source, reference, isOpen]);

  // Traitement des données pour le graphique
  const processChartData = useMemo(() => {
    if (!currentTableData || currentTableData.length < 2) return [];

    const [, ...rows] = currentTableData;
    
    // Si vue annuelle, utiliser la colonne J-D (colonne 13)
    const dataIndex = viewType === 'annual' ? 13 : month;
    
    if (viewType === 'monthly' && (dataIndex < 1 || dataIndex > 12)) return [];

    const data = rows
      .map(row => {
        const year = parseInt(row[0]);
        const value = parseFloat(row[dataIndex]);
        
        if (isNaN(year) || isNaN(value)) return null;
        
        // Ajouter des annotations pour les années notables
        let notable = null;
        const currentYear = new Date().getFullYear();
        
        if (viewType === 'monthly') {
          if (year === 1883 && month === 8) notable = translations?.krakatoa || 'Krakatoa Eruption';
          if (year === 1991 && month === 6) notable = translations?.pinatubo || 'Mount Pinatubo Eruption';
          if (year === 2016 && month >= 1 && month <= 4) notable = translations?.elNinoIntense || 'Intense El Niño';
          if (year === 1998 && month >= 1 && month <= 6) notable = translations?.elNinoRecord || 'Record El Niño';
          
        } else {
          // Annotations pour vue annuelle
          if (year === 1883) notable = translations?.krakatoa || 'Krakatoa Eruption';
          if (year === 1991) notable = translations?.pinatubo || 'Mount Pinatubo Eruption';
          if (year === 2016) notable = translations?.elNinoIntense || 'Intense El Niño';
          if (year === 1998) notable = translations?.elNinoRecord || 'Record El Niño';
          
        }

        return {
          year,
          value,
          notable,
          decade: Math.floor(year / 10) * 10,
          isCurrentYear: viewType === 'annual' && year === currentYear // Seulement en mode annuel
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.year - b.year);

    // En mode annuel, vérifier si l'année courante est présente
    if (viewType === 'annual') {
      const currentYear = new Date().getFullYear();
      const hasCurrentYear = data.some(d => d.year === currentYear);
      
      if (!hasCurrentYear) {
        // Chercher les données mensuelles pour l'année courante
        const currentYearRow = rows.find(row => parseInt(row[0]) === currentYear);
        
        if (currentYearRow) {
          // Calculer la moyenne des mois disponibles (colonnes 1-12)
          const monthlyValues = [];
          for (let monthCol = 1; monthCol <= 12; monthCol++) {
            const value = parseFloat(currentYearRow[monthCol]);
            if (!isNaN(value)) {
              monthlyValues.push(value);
            }
          }
          
          if (monthlyValues.length > 0) {
            const averageValue = monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length;
            
            // Ajouter ce point calculé
            data.push({
              year: currentYear,
              value: averageValue,
              notable: null,
              decade: Math.floor(currentYear / 10) * 10,
              isCurrentYear: true,
              isCalculated: true, // Indiquer que c'est calculé
              monthsUsed: monthlyValues.length // Nombre de mois utilisés
            });
            
            // Re-trier après ajout
            data.sort((a, b) => a.year - b.year);
          }
        }
      }
    }

    return data;
  }, [currentTableData, month, viewType]);

  // Fonction pour exporter le graphique
  const exportChart = async () => {
    if (!chartRef.current) return;
    
    const monthNames = ['', 
      translations?.monthNames?.[1] || 'January', translations?.monthNames?.[2] || 'February', translations?.monthNames?.[3] || 'March',
      translations?.monthNames?.[4] || 'April', translations?.monthNames?.[5] || 'May', translations?.monthNames?.[6] || 'June',
      translations?.monthNames?.[7] || 'July', translations?.monthNames?.[8] || 'August', translations?.monthNames?.[9] || 'September',
      translations?.monthNames?.[10] || 'October', translations?.monthNames?.[11] || 'November', translations?.monthNames?.[12] || 'December'
    ];
    const filename = `anomalies-${viewType === 'annual' ? 'annual' : monthNames[month]}-${source}-${reference}.png`;
    
    try {
      // Capturer l'élément du graphique
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#0f0f0f',
        scale: 2, // Meilleure qualité
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: chartRef.current.offsetWidth,
        height: chartRef.current.offsetHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // Créer le lien de téléchargement
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export du graphique');
    }
  };

  // Couleur dynamique basée sur la source
  const getLineColor = () => {
    switch (source) {
      case 'global': return '#ff0080';
      case 'north': return '#00ff88';
      case 'south': return '#ff8c00';
      default: return '#64b5f6';
    }
  };

  const monthNames = ['', 
    translations?.monthNames?.[1] || 'January', translations?.monthNames?.[2] || 'February', translations?.monthNames?.[3] || 'March',
    translations?.monthNames?.[4] || 'April', translations?.monthNames?.[5] || 'May', translations?.monthNames?.[6] || 'June',
    translations?.monthNames?.[7] || 'July', translations?.monthNames?.[8] || 'August', translations?.monthNames?.[9] || 'September',
    translations?.monthNames?.[10] || 'October', translations?.monthNames?.[11] || 'November', translations?.monthNames?.[12] || 'December'
  ];

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
            ref={chartRef}
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
              maxWidth: isMobile ? '95vw' : '90vw',
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
                  <BarChart3 size={24} color="#64b5f6" />
                </motion.div>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: '700' }}>
                    {viewType === 'annual' ? (translations?.annualAnomalies || 'Annual Anomalies') : `${translations?.monthlyAnomalies || 'Anomalies for'} ${monthNames[month]}`}
                  </h2>
                  <p style={{ margin: 0, fontSize: '14px', color: '#bbb' }}>
                    {source === 'global' ? 'Global' : source === 'north' ? 'Northern Hemisphere' : 'Southern Hemisphere'} • 1880-{new Date().getFullYear()}
                    {viewType === 'annual' && <span style={{ color: '#ffc107' }}> • Current year ({new Date().getFullYear()}) highlighted</span>}
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888' }}>
                    Chart from{' '}
                    <a 
                      href="https://nasa-gistemp-viewer.vercel.app" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        color: '#64b5f6',
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      Nasa Gistemp Viewer
                    </a>
                    {' '}(nasa-gistemp-viewer.vercel.app)
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

            {/* Contrôles */}
            <ChartControls
              month={month}
              onMonthChange={setMonth}
              reference={reference}
              onReferenceChange={setReference}
              source={source}
              onSourceChange={setSource}
              viewType={viewType}
              onViewTypeChange={setViewType}
              onExport={exportChart}
              translations={translations}
            />

            {/* Graphique */}
            <div style={{
              height: isMobile ? '400px' : '500px',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              padding: '20px'
            }}>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#888',
                  fontSize: '16px'
                }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ marginRight: '10px' }}
                  >
                    <BarChart3 size={24} color="#64b5f6" />
                  </motion.div>
                  {translations?.loadingData || 'Loading data...'}
                </div>
              ) : processChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processChartData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(255, 255, 255, 0.1)" 
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="year" 
                      stroke="#888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                    />
                    <YAxis 
                      stroke="#888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                      label={{ 
                        value: 'Anomalie (°C)', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: '#888' }
                      }}
                    />
                    <Tooltip content={<SimpleTooltip currentYearText={translations?.currentYearTooltip || "(Current year)"} />} />
                    <ReferenceLine 
                      y={0} 
                      stroke="rgba(255, 255, 255, 0.5)" 
                      strokeDasharray="2 2" 
                      strokeWidth={1}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getLineColor()}
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload, index } = props;
                        if (payload && payload.isCurrentYear) {
                          return (
                            <circle
                              key={`current-year-${index}`}
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill={payload.isCalculated ? "none" : getLineColor()}
                              stroke="#ffc107"
                              strokeWidth={3}
                              strokeDasharray={payload.isCalculated ? "4,2" : "0"}
                              opacity={1}
                            />
                          );
                        }
                        return null; // Supprime les points normaux
                      }}
                      activeDot={{ 
                        r: 4, 
                        fill: getLineColor(),
                        strokeWidth: 2,
                        stroke: '#fff'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#888',
                  fontSize: '16px'
                }}>
                  {translations?.loadingData || 'Loading data...'}
                </div>
              )}
            </div>

            {/* Légende */}
            {processChartData.length > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                margin: '16px 0',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '12px',
                color: '#ccc'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '12px',
                    height: '2px',
                    background: getLineColor(),
                    borderRadius: '1px'
                  }} />
                  <span>{viewType === 'annual' ? 'Données annuelles' : 'Données mensuelles'}</span>
                </div>
                {viewType === 'annual' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: getLineColor(),
                      borderRadius: '50%',
                      border: '2px solid #ffc107'
                    }} />
                    <span>Année courante ({new Date().getFullYear()}) - calculée</span>
                  </div>
                )}
              </div>
            )}

            {/* Statistiques */}
            {processChartData.length > 0 && (() => {
              // Fonction pour calculer la tendance par décennie (régression linéaire)
              const calculateTrendPerDecade = (data, startYear) => {
                const filteredData = data.filter(d => d.year >= startYear);
                if (filteredData.length < 2) return 0;
                
                const n = filteredData.length;
                const sumX = filteredData.reduce((sum, d) => sum + d.year, 0);
                const sumY = filteredData.reduce((sum, d) => sum + d.value, 0);
                const sumXY = filteredData.reduce((sum, d) => sum + d.year * d.value, 0);
                const sumX2 = filteredData.reduce((sum, d) => sum + d.year * d.year, 0);
                
                const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                
                return slope * 10; // Tendance par décennie
              };
              
              const trends = [
                { label: `${translations?.trendPerDecade || 'Trend/decade'} 1880`, value: calculateTrendPerDecade(processChartData, 1880), color: '#ff6b6b' },
                { label: `${translations?.trendPerDecade || 'Trend/decade'} 1950`, value: calculateTrendPerDecade(processChartData, 1950), color: '#ffc107' },
                { label: `${translations?.trendPerDecade || 'Trend/decade'} 2000`, value: calculateTrendPerDecade(processChartData, 2000), color: '#ff4444' }
              ];
              
              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
                  gap: '16px',
                  marginTop: '20px'
                }}>
                  {trends.map((stat, idx) => (
                    <div key={idx} style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>
                        {stat.label}
                      </div>
                      <div style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        color: stat.color 
                      }}>
                        {stat.value > 0 ? '+' : ''}{stat.value.toFixed(2)}°C
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}