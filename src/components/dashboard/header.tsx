
'use client';

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CircleUser, Download } from 'lucide-react';
import { Separator } from '../ui/separator';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './language-switcher';

interface DashboardHeaderProps {
  onExport: () => void;
}

const DashboardHeader: FC<DashboardHeaderProps> = ({ onExport }) => {
  const { t } = useTranslation();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
      <div className='flex-1 pl-10 lg:pl-0'>
        <h1 className="text-lg font-semibold md:text-xl">{t('dashboard')}</h1>
      </div>
      <LanguageSwitcher />
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" />
        {t('export')}
      </Button>
      <Separator orientation="vertical" className="h-8" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t('my_account')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t('settings')}</DropdownMenuItem>
          <DropdownMenuItem>{t('support')}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>{t('logout')}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default DashboardHeader;
