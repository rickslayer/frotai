
'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Car, SlidersHorizontal, FilterX } from 'lucide-react';
import type { FilterOptions, Filters } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { SidebarHeader, SidebarContent, SidebarFooter } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Combobox } from '../ui/combobox';
import { MultiSelectDropdown } from '../ui/multi-select-dropdown';

interface DashboardSidebarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: any) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
  isModelDisabled: boolean;
  isVersionDisabled: boolean;
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({
    filters,
    onFilterChange,
    onClearFilters,
    filterOptions,
    isModelDisabled,
    isVersionDisabled,
}) => {
  const { t } = useTranslation();

  const handleFilterValueChange = (key: keyof Filters, value: string | string[] | number) => {
    onFilterChange(key, value);
  };

  const hasActiveFilters = Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f && f !== ''));


  return (
    <>
      <SidebarHeader>
        <div className="flex h-14 items-center justify-between px-4 lg:h-[60px] lg:px-2">
            <Link href="/" className="flex items-center gap-3 font-semibold text-primary">
              <Car className="h-6 w-6" />
              <span className="text-lg text-foreground">Frota.AI</span>
            </Link>
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">{t('filters')}</h2>
            <Accordion type="multiple" defaultValue={['vehicle']} className="w-full">
              <AccordionItem value="vehicle">
                <AccordionTrigger>
                  <div className='flex items-center gap-2'>
                    <SlidersHorizontal className="h-4 w-4" /> <span>{t('vehicle')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <Select value={filters.manufacturer} onValueChange={(value) => handleFilterValueChange('manufacturer', value as string)}>
                    <SelectTrigger><SelectValue placeholder={t('select_manufacturer')} /></SelectTrigger>
                    <SelectContent>
                      {(filterOptions.manufacturers || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Combobox
                    items={(filterOptions.models || []).map(m => ({ value: m, label: m }))}
                    value={filters.model}
                    onChange={(value) => handleFilterValueChange('model', value)}
                    placeholder={t('select_model')}
                    searchPlaceholder={t('search_model_placeholder')}
                    noResultsText={t('no_model_found')}
                    disabled={isModelDisabled}
                  />
                   <MultiSelectDropdown
                      options={(filterOptions.versions || []).map(v => ({ value: v, label: v || t('base_model_version')}))}
                      selectedValues={filters.version}
                      onChange={(selected) => handleFilterValueChange('version', selected)}
                      placeholder={t('select_version_multi')}
                      disabled={isVersionDisabled}
                   />
                   <Select value={String(filters.year)} onValueChange={(value) => handleFilterValueChange('year', value)}>
                    <SelectTrigger><SelectValue placeholder={t('select_year')} /></SelectTrigger>
                    <SelectContent>
                      {(filterOptions.years || []).map(y => <SelectItem key={y} value={String(y)}>{y === 0 ? "Indefinido" : y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
         <div className="mt-auto p-4">
          <Button variant="ghost" className="w-full justify-center" onClick={onClearFilters} disabled={!hasActiveFilters}>
             <FilterX className="mr-2 h-4 w-4" />
            <span>{t('clear_all_filters')}</span>
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
};

export default DashboardSidebar;
