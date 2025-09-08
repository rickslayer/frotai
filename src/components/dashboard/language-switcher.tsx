'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { Languages } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {currentLanguage === 'pt' ? (
            <Image src="/flags/br.svg" alt="Brasil" width={20} height={20} />
          ) : (
            <Image src="/flags/us.svg" alt="United States" width={20} height={20} />
          )}
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage('en')}>
          <Image src="/flags/us.svg" alt="United States" width={20} height={20} className="mr-2" />
          <span>Inglês</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage('pt')}>
          <Image src="/flags/br.svg" alt="Brasil" width={20} height={20} className="mr-2" />
          <span>Português</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
