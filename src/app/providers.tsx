'use client';

import React, { useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

// Wrapper component to apply language to html tag
function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);
  return <>{children}</>;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageWrapper>
        {children}
      </LanguageWrapper>
    </I18nextProvider>
  );
}
