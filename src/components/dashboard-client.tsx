
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import FleetByYearChart from './dashboard/fleet-by-year-chart';
import TopModelsChart from './dashboard/top-models-chart';
import FilterSuggestions from './dashboard/filter-suggestions';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FleetAgeDistributionChart from './dashboard/fleet-age-distribution-chart';

interface DashboardClientProps {
  initialData: Vehicle[];
}

const getFilterOptions = (data: Vehicle[]): FilterOptions => {
  const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
  const models = [...new Set(data.map(item => item.model))].sort();
  const versions = [...new Set(data.map(item => item.version))].sort();
  const states = [...new Set(data.map(item => item.state))].sort();
  const cities = [...new Set(data.map(item => item.city))].sort();
  const categories = [...new Set(data.map(item => item.category))].sort() as FilterOptions['categories'];
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
  return { manufacturers, models, versions, states, cities, categories, years };
};

const DashboardClient: FC<DashboardClientProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    state: 'all',
    city: 'all',
    manufacturer: 'all',
    model: 'all',
    version: 'all',
    category: 'all',
    year: 'all',
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleExport = () => {
    alert(t('export_planned_feature'));
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
    setIsSheetOpen(false);
  }, []);

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const { state, city, manufacturer, model, version, category, year } = filters;
      
      return (
        (state === 'all' || item.state === state) &&
        (city === 'all' || item.city === city) &&
        (manufacturer === 'all' || item.manufacturer === manufacturer) &&
        (model === 'all' || item.model === model) &&
        (version === 'all' || item.version === version) &&
        (category === 'all' || item.category === category) &&
        (year === 'all' || item.year === year)
      );
    });
  }, [initialData, filters]);
  
  // Opções de filtro que são usadas em todo o sistema.
  // Sempre derivado do conjunto de dados inicial completo.
  const allAvailableOptions = useMemo(() => getFilterOptions(initialData), [initialData]);

  // Opções dinâmicas que mudam com base nos filtros (ex: cidades de um estado selecionado).
  const dynamicFilterOptions = useMemo(() => {
    let dataForOptions = initialData;
    if (filters.state !== 'all') {
      dataForOptions = dataForOptions.filter(item => item.state === filters.state);
    }
    if (filters.manufacturer !== 'all') {
      dataForOptions = dataForOptions.filter(item => item.manufacturer === filters.manufacturer);
    }
    if (filters.model !== 'all') {
       dataForOptions = dataForOptions.filter(item => item.model === filters.model);
    }
    return getFilterOptions(dataForOptions);
  }, [initialData, filters.state, filters.manufacturer, filters.model]);


  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          dynamicFilterOptions={dynamicFilterOptions}
          allAvailableOptions={allAvailableOptions}
        />
      </div>
      <div className="flex flex-col">
        <DashboardHeader onExport={handleExport}>
           <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <DashboardSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  dynamicFilterOptions={dynamicFilterOptions}
                  allAvailableOptions={allAvailableOptions}
                />
            </SheetContent>
          </Sheet>
        </DashboardHeader>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
          <div className="bg-background p-4 rounded-lg border">
            <FilterSuggestions onApplyFilters={handleFilterChange} />
          </div>
          <StatCards data={filteredData} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <FleetByYearChart data={filteredData} />
            <TopModelsChart data={filteredData} />
            <FleetAgeDistributionChart data={filteredData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
