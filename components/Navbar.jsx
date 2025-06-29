'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import HelpModal from './HelpModal';

export default function Navbar() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <>
      <nav>
        <div className="logo">Nasa Gistemp Viewer</div>
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
              Mode d'emploi
            </button>
          </li>
          <li><Link href="#data">Données</Link></li>
          <li><Link href="#about">À propos</Link></li>
        </ul>
      </nav>

      <HelpModal 
        isOpen={helpModalOpen} 
        onClose={() => setHelpModalOpen(false)} 
      />
    </>
  );
}