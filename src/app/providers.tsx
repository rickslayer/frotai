'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

// Wrapper component to apply language to html tag and prevent hydration errors
function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language, isMounted]);

  // Render children only after the component has mounted on the client
  // This prevents hydration mismatch for language-dependent rendering
  if (!isMounted) {
    return null; 
  }

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
