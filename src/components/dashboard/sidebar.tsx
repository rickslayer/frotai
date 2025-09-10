
'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Car, MapPin, Calendar, SlidersHorizontal, FilterX } from 'lucide-react';
import type { FilterOptions, Filters } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { SidebarHeader, SidebarTrigger, SidebarContent, SidebarFooter } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { Combobox } from '../ui/combobox';
import { MultiSelectDropdown } from '../ui/multi-select-dropdown';

interface DashboardSidebarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  filterOptions: FilterOptions;
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({ filters, onFilterChange, filterOptions }) => {
  const { t } = useTranslation();
  
  const handleFilterValueChange = (key: keyof Filters, value: string | string[] | number) => {
    if (key === 'year') {
      onFilterChange({ year: value === 'all' ? 'all' : Number(value) });
    } else {
      onFilterChange({ [key]: value });
    }
  };

  const clearFilters = () => {
    onFilterChange({
      state: '',
      city: '',
      manufacturer: '',
      model: '',
      version: [],
      year: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f && f !== 'all'));


  return (
    <>
      <SidebarHeader>
        <div className="flex h-14 items-center justify-between px-4 lg:h-[60px] lg:px-2">
            <Link href="/" className="flex items-center gap-3 font-semibold text-primary">
              <Car className="h-6 w-6" />
              <span className="text-lg text-foreground group-data-[collapsible=icon]:hidden">Frota.AI</span>
            </Link>
            <SidebarTrigger className='hidden lg:flex' />
        </div>
        <Separator />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1">
          <div className="p-4">
            <h2 className="mb-4 text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">{t('filters')}</h2>
            <Accordion type="multiple" defaultValue={['location', 'vehicle', 'time']} className="w-full">
              <AccordionItem value="location">
                <AccordionTrigger>
                  <div className='flex items-center gap-2'>
                    <MapPin className="h-4 w-4" /> <span className='group-data-[collapsible=icon]:hidden'>{t('location')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4 group-data-[collapsible=icon]:hidden">
                  <Select value={filters.state} onValueChange={(value) => handleFilterValueChange('state', value)}>
                    <SelectTrigger><SelectValue placeholder={t('select_state')} /></SelectTrigger>
                    <SelectContent>
                      {filterOptions.states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={filters.city} onValueChange={(value) => handleFilterValueChange('city', value)} disabled={!filters.state || filters.state === 'all'}>
                    <SelectTrigger><SelectValue placeholder={t('select_city')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_cities')}</SelectItem>
                      {filterOptions.cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="vehicle">
                <AccordionTrigger>
                  <div className='flex items-center gap-2'>
                    <SlidersHorizontal className="h-4 w-4" /> <span className='group-data-[collapsible=icon]:hidden'>{t('vehicle')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4 group-data-[collapsible=icon]:hidden">
                  <Select value={filters.manufacturer} onValueChange={(value) => handleFilterValueChange('manufacturer', value as string)}>
                    <SelectTrigger><SelectValue placeholder={t('select_manufacturer')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_manufacturers')}</SelectItem>
                      {filterOptions.manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Combobox 
                    items={filterOptions.models.map(m => ({ value: m, label: m }))}
                    value={filters.model}
                    onChange={(value) => handleFilterValueChange('model', value)}
                    placeholder={t('select_model')}
                    searchPlaceholder={t('search_model_placeholder')}
                    noResultsText={t('no_model_found')}
                    disabled={!filters.manufacturer || filters.manufacturer === 'all'}
                  />
                   <MultiSelectDropdown
                      options={filterOptions.versions.map(v => ({ value: v || 'base', label: v || t('base_model_version')}))}
                      selectedValues={filters.version}
                      onChange={(selected) => handleFilterValueChange('version', selected)}
                      placeholder="Selecione a(s) Versão(ões)"
                      disabled={!filters.model || filters.model === 'all'}
                   />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="time">
                <AccordionTrigger>
                  <div className='flex items-center gap-2'>
                    <Calendar className="h-4 w-4" /> <span className='group-data-[collapsible=icon]:hidden'>{t('manufacturing_year')}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 group-data-[collapsible=icon]:hidden">
                   <Select value={String(filters.year)} onValueChange={(value) => handleFilterValueChange('year', value)}>
                    <SelectTrigger><SelectValue placeholder={t('select_year')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('all_years')}</SelectItem>
                      {filterOptions.years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
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
          <Button variant="ghost" className="w-full justify-center" onClick={clearFilters} disabled={!hasActiveFilters}>
             <FilterX className="mr-2 h-4 w-4" />
            <span className='group-data-[collapsible=icon]:hidden'>{t('clear_all_filters')}</span>
          </Button>
        </div>
      </SidebarFooter>
    </>
  );
};

export default DashboardSidebar;
