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
import { getFilterOptions } from '@/lib/data';

interface DashboardClientProps {
  initialData: Vehicle[];
  allFilterOptions: FilterOptions;
}

const DashboardClient: FC<DashboardClientProps> = ({ initialData, allFilterOptions }) => {
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

  const handleExport = () => {
    alert(t('export_planned_feature'));
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
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

  const dynamicFilterOptions = useMemo(() => {
    let partiallyFilteredData = initialData;
    if (filters.state !== 'all') {
      partiallyFilteredData = partiallyFilteredData.filter(item => item.state === filters.state);
    }
    if (filters.manufacturer !== 'all') {
      partiallyFilteredData = partiallyFilteredData.filter(item => item.manufacturer === filters.manufacturer);
    }
    if (filters.model !== 'all') {
      partiallyFilteredData = partiallyFilteredData.filter(item => item.model === filters.model);
    }

    return getFilterOptions(partiallyFilteredData);
  }, [initialData, filters]);

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={dynamicFilterOptions}
          allFilterOptions={allFilterOptions}
        />
      </div>
      <div className="flex flex-col">
        <DashboardHeader onExport={handleExport}>
           <Sheet>
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
                  filterOptions={dynamicFilterOptions}
                  allFilterOptions={allFilterOptions}
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
