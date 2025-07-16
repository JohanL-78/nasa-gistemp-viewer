'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HelpCircle, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import HelpModal from './HelpModal';
import { useTranslation } from '../hooks/useTranslation';

export default function Navbar() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const { t, locale } = useTranslation();
  const router = useRouter();

  const changeLanguage = (newLocale) => {
    router.push(`/${newLocale}`);
  };

  return (
    <>
      <nav>
        <div className="logo">{t('nav.logo')}</div>
        <ul>
          <li>
            <button 
              onClick={() => setHelpModalOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                font: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0'
              }}
            >
              <HelpCircle size={16} />
              {t('nav.help')}
            </button>
          </li>
          <li><Link href="#data">{t('nav.data')}</Link></li>
          <li><Link href="#about">{t('nav.about')}</Link></li>
          <li>
            <button 
              onClick={() => changeLanguage(locale === 'fr' ? 'en' : 'fr')}
              style={{
                background: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                color: 'inherit',
                font: 'inherit',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '14px'
              }}
              title={locale === 'fr' ? 'Switch to English' : 'Passer au français'}
            >
              <Globe size={14} />
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
          </li>
        </ul>
      </nav>

      <HelpModal 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
      />
    </>
  );
}