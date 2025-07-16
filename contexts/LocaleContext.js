'use client';

import React, { createContext, useContext } from 'react';
import translations from '../locales/translations.json';

const LocaleContext = createContext();

export function LocaleProvider({ locale, children }) {
  const t = translations[locale] || translations.fr;
  
  const getTranslation = (key) => {
    const keys = key.split('.');
    let result = t;
    for (const k of keys) {
      result = result?.[k];
    }
    return result || key;
  };
  
  const value = {
    t: getTranslation,
    locale,
    isEnglish: locale === 'en',
    isFrench: locale === 'fr'
  };
  
  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return context;
}