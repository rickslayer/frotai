'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Car, MapPin, Calendar, SlidersHorizontal } from 'lucide-react';
import type { FilterOptions, Filters } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';

interface DashboardSidebarProps {
  filters: Filters;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  filterOptions: FilterOptions;
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({ filters, onFilterChange, filterOptions }) => {
  const { t } = useTranslation();
  
  const handleSelectChange = (key: keyof Omit<Filters, 'year'>, value: string) => {
    const newFilters: Partial<Filters> = {[key]: value};
    // Reinicia os filtros dependentes quando o filtro pai muda.
    if (key === 'state') newFilters.city = 'all';
    if (key === 'manufacturer') {
      newFilters.model = 'all';
    }
    onFilterChange(newFilters);
  };

  const handleYearChange = (value: string) => {
    onFilterChange({ year: value === 'all' ? 'all' : Number(value) });
  };

  const clearFilters = () => {
    onFilterChange({
      state: 'all',
      city: 'all',
      manufacturer: 'all',
      model: 'all',
      year: 'all',
    });
  };

  return (
    <div className="flex h-full max-h-screen flex-col gap-2 bg-card">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/" className="flex items-center gap-3 font-semibold text-primary">
          <Car className="h-6 w-6" />
          <span className="text-lg text-foreground">Frota.AI</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">{t('filters')}</h2>
          <Accordion type="multiple" defaultValue={['location', 'vehicle', 'time']} className="w-full">
            <AccordionItem value="location">
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                  <MapPin className="h-4 w-4" /> {t('location')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <Select value={filters.state} onValueChange={(value) => handleSelectChange('state', value)}>
                  <SelectTrigger><SelectValue placeholder={t('select_state')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_states')}</SelectItem>
                    {filterOptions.states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.city} onValueChange={(value) => handleSelectChange('city', value)} disabled={filters.state === 'all'}>
                  <SelectTrigger><SelectValue placeholder={t('select_city')} /></SelectValue>
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
                  <SlidersHorizontal className="h-4 w-4" /> {t('vehicle')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <Select value={filters.manufacturer} onValueChange={(value) => handleSelectChange('manufacturer', value)}>
                  <SelectTrigger><SelectValue placeholder={t('select_manufacturer')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_manufacturers')}</SelectItem>
                    {filterOptions.manufacturers.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.model} onValueChange={(value) => handleSelectChange('model', value)} disabled={filters.manufacturer === 'all'}>
                  <SelectTrigger><SelectValue placeholder={t('select_model')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_models')}</SelectItem>
                    {filterOptions.models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="time">
              <AccordionTrigger>
                <div className='flex items-center gap-2'>
                  <Calendar className="h-4 w-4" /> {t('manufacturing_year')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                 <Select value={String(filters.year)} onValueChange={handleYearChange}>
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
       <div className="mt-auto p-4 border-t">
        <Button variant="ghost" className="w-full justify-center" onClick={clearFilters}>
          {t('clear_all_filters')}
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;