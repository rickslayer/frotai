
'use client';

import type { FC } from 'react';
import Link from 'next/link';
import { Car, FilterX, MapPin, Package } from 'lucide-react';
import type { FilterOptions, Filters } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslation } from 'react-i18next';
import { SidebarHeader, SidebarContent, SidebarFooter } from '../ui/sidebar';
import { Separator } from '../ui/separator';
import { MultiSelectDropdown } from '../ui/multi-select-dropdown';

interface DashboardSidebarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: any) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
  disabledFilters: {
    model: boolean;
    version: boolean;
    state: boolean;
    city: boolean;
  };
}

const DashboardSidebar: FC<DashboardSidebarProps> = ({
    filters,
    onFilterChange,
    onClearFilters,
    filterOptions,
    disabledFilters,
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
        <ScrollArea className="flex-1 px-4">
          <div className='space-y-4 pt-4'>
            <div className="space-y-2">
                <h3 className='font-semibold flex items-center gap-2'><MapPin className="h-4 w-4" />{t('location')}</h3>
                <Select value={filters.region} onValueChange={(value) => handleFilterValueChange('region', value as string)}>
                  <SelectTrigger><SelectValue placeholder={t('select_region')} /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{t('all_regions')}</SelectItem>
                    {(filterOptions.regions || []).map(r => <SelectItem key={r} value={r}>{t(r as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.state} onValueChange={(value) => handleFilterValueChange('state', value as string)} disabled={disabledFilters.state}>
                  <SelectTrigger><SelectValue placeholder={t('select_state')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_states')}</SelectItem>
                    {(filterOptions.states || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                  <Select value={filters.city} onValueChange={(value) => handleFilterValueChange('city', value as string)} disabled={disabledFilters.city}>
                  <SelectTrigger><SelectValue placeholder={t('select_city')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_cities')}</SelectItem>
                    {(filterOptions.cities || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
             <Separator />
             <div className="space-y-2">
                <h3 className='font-semibold flex items-center gap-2'><Car className="h-4 w-4" />{t('vehicle')}</h3>
                <Select value={filters.manufacturer} onValueChange={(value) => handleFilterValueChange('manufacturer', value as string)}>
                  <SelectTrigger><SelectValue placeholder={t('select_manufacturer')} /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="all">{t('all_manufacturers')}</SelectItem>
                    {(filterOptions.manufacturers || []).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                <MultiSelectDropdown
                    options={(filterOptions.models || []).map(m => ({ value: m || 'null_model', label: m || t('base_model')}))}
                    selectedValues={filters.model}
                    onChange={(selected) => handleFilterValueChange('model', selected)}
                    placeholder={t('select_model')}
                    disabled={disabledFilters.model}
                  />
                  <MultiSelectDropdown
                    options={(filterOptions.versions || []).map(v => ({ value: v || 'null_version', label: v || t('base_model_version')}))}
                    selectedValues={filters.version}
                    onChange={(selected) => handleFilterValueChange('version', selected)}
                    placeholder={t('select_version_multi')}
                    disabled={disabledFilters.version}
                  />
                  <Select value={String(filters.year)} onValueChange={(value) => handleFilterValueChange('year', value)}>
                  <SelectTrigger><SelectValue placeholder={t('select_year')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all_years')}</SelectItem>
                    {(filterOptions.years || []).map(y => <SelectItem key={y} value={String(y)}>{y === 0 ? t('Indefinido') : y}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
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
