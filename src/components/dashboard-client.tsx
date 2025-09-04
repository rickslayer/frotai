'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Sale, FilterOptions, Filters } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import SalesOverTimeChart from './dashboard/sales-over-time-chart';
import TopModelsChart from './dashboard/top-models-chart';
import FilterSuggestions from './dashboard/filter-suggestions';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';

interface DashboardClientProps {
  initialData: Sale[];
  filterOptions: FilterOptions;
}

const DashboardClient: FC<DashboardClientProps> = ({ initialData, filterOptions }) => {
  const [filters, setFilters] = useState<Filters>({
    state: 'all',
    city: 'all',
    manufacturer: 'all',
    model: 'all',
    version: 'all',
    category: 'all',
    dateRange: { from: undefined, to: undefined },
  });

  const handleExport = () => {
    // Placeholder for export functionality
    alert('Exporting reports is a planned feature.');
  };
  
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({...prev, ...newFilters}));
  }, []);

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const { state, city, manufacturer, model, version, category, dateRange } = filters;
      const itemDate = parseISO(item.date);
      
      const dateInRange =
        !dateRange.from || !dateRange.to
          ? true
          : isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to });

      return (
        (state === 'all' || item.state === state) &&
        (city === 'all' || item.city === city) &&
        (manufacturer === 'all' || item.manufacturer === manufacturer) &&
        (model === 'all' || item.model === model) &&
        (version === 'all' || item.version === version) &&
        (category === 'all' || item.category === category) &&
        dateInRange
      );
    });
  }, [initialData, filters]);

  const cityOptions = useMemo(() => {
    if (filters.state === 'all') return filterOptions.cities;
    return [...new Set(initialData.filter(d => d.state === filters.state).map(d => d.city))].sort();
  }, [filters.state, initialData, filterOptions.cities]);

  const modelOptions = useMemo(() => {
    if (filters.manufacturer === 'all') return filterOptions.models;
    return [...new Set(initialData.filter(d => d.manufacturer === filters.manufacturer).map(d => d.model))].sort();
  }, [filters.manufacturer, initialData, filterOptions.models]);

  const versionOptions = useMemo(() => {
    if (filters.model === 'all') return filterOptions.versions;
    return [...new Set(initialData.filter(d => d.model === filters.model).map(d => d.version))].sort();
  }, [filters.model, initialData, filterOptions.versions]);

  const dynamicFilterOptions = { ...filterOptions, cities: cityOptions, models: modelOptions, versions: versionOptions };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={dynamicFilterOptions}
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
                />
            </SheetContent>
          </Sheet>
        </DashboardHeader>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <FilterSuggestions onApplyFilters={handleFilterChange} />
          <StatCards data={filteredData} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SalesOverTimeChart data={filteredData} />
            </div>
            <div>
              <TopModelsChart data={filteredData} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
