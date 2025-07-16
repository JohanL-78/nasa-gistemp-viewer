'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function DataTable({ initialData }) {
  const [tableData, setTableData] = useState(initialData);
  const [sortOrder, setSortOrder] = useState({});
  const [source, setSource] = useState('global');
  const [reference, setReference] = useState('nasa');
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      try {
        const params = new URLSearchParams({ source, reference });
        const res = await fetch(`/api/table?${params.toString()}`);
        const data = await res.json();
        setTableData(data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    }
    fetchData();
  }, [source, reference]);

  const sortTableByColumn = (colIndex) => {
    const order = sortOrder[colIndex] === 'desc' ? 'asc' : 'desc';
    setSortOrder({ [colIndex]: order });

    const header = tableData[0];
    let rows = [...tableData.slice(1)];

    const numericSamples = rows.map(row => parseFloat(row[colIndex])).filter(v => !isNaN(v));
    const isNumeric = numericSamples.length > rows.length / 2;

    const parse = (val) => {
      const num = parseFloat(val);
      return isNaN(num) ? -Infinity : num;
    };

    rows.sort((a, b) => {
      if (isNumeric) {
        const aVal = parse(a[colIndex]);
        const bVal = parse(b[colIndex]);
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      } else {
        const aVal = a[colIndex]?.toLowerCase?.() || '';
        const bVal = b[colIndex]?.toLowerCase?.() || '';
        if (aVal < bVal) return order === 'desc' ? 1 : -1;
        if (aVal > bVal) return order === 'desc' ? -1 : 1;
        return 0;
      }
    });

    setTableData([header, ...rows]);
  };

  if (!tableData || tableData.length < 2) {
    return <p>{t('table.loading')}</p>;
  }

  const header = tableData[0];
  const rows = tableData.slice(1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="source">{t('table.chooseRegion')} </label>
          <select id="source" value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="global">{t('table.global')}</option>
            <option value="north">{t('table.north')}</option>
            <option value="south">{t('table.south')}</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="reference">{t('table.referencePeriod')} </label>
          <select id="reference" value={reference} onChange={(e) => setReference(e.target.value)}>
            <option value="nasa">{t('table.nasa')}</option>
            <option value="preindustrial">{t('table.preindustrial')}</option>
            <option value="modern">{t('table.modern')}</option>
          </select>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            {header.map((headerText, index) => (
              <th key={index} onClick={() => sortTableByColumn(index)} style={{ cursor: 'pointer' }}>
                {headerText}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => {
                let style = {};
                if (cellIndex > 0 && !isNaN(parseFloat(cell))) {
                  const temp = parseFloat(cell);
                  if (temp > 0) {
                    const intensity = Math.min(255, Math.floor(temp * 100));
                    style.backgroundColor = `rgba(255, ${255 - intensity}, ${255 - intensity}, 0.7)`;
                  } else if (temp < 0) {
                    const intensity = Math.min(255, Math.floor(Math.abs(temp) * 100));
                    style.backgroundColor = `rgba(${255 - intensity}, ${255 - intensity}, 255, 0.7)`;
                  }
                }
                return <td key={cellIndex} style={style}>{cell}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
