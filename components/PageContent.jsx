'use client';

import { useTranslation } from '@/hooks/useTranslation';
import Navbar from './Navbar';
import ClimateGlobe from './ClimateGlobe';
import DataTable from './DataTable';

export default function PageContent({ availableDates, tableData }) {
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      
      <main>
        <div className="globe-section">
          <ClimateGlobe availableDates={availableDates} />
        </div>

        <div className="data-section" id="data">
          <h2>{t('page.dataTitle')}</h2>
          <DataTable initialData={tableData} />
        </div>

        <div className="data-section" id="about">
          <h2>{t('page.aboutTitle')}</h2>
          <p>{t('page.aboutText1')}</p>
          <p>
            {t('page.aboutText2')} <strong>Johan Lorck</strong>
          </p>
          <p>
            <a href="https://github.com/JohanL-78/nasa-gistemp-viewer">
              {t('page.aboutText3')}
            </a>
          </p>
        </div>
      </main>
    </>
  );
}