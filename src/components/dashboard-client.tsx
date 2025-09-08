'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import FleetAnalysis from './dashboard/fleet-by-year-chart';
import TopModelsChart from './dashboard/top-models-chart';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FleetAgeBracketChart from './dashboard/fleet-age-bracket-chart';

interface DashboardClientProps {
  initialData: Vehicle[];
}

const getFilterOptions = (data: Vehicle[]): FilterOptions => {
  const states = [...new Set(data.map(item => item.state))].sort();
  const cities = [...new Set(data.map(item => item.city))].sort();
  const manufacturers = [...new Set(data.map(item => item.manufacturer))].sort();
  const models = [...new Set(data.map(item => item.model))].sort();
  const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
  return { states, cities, manufacturers, models, years };
};

const DashboardClient: FC<DashboardClientProps> = ({ initialData }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<Filters>({
    state: 'all',
    city: 'all',
    manufacturer: 'all',
    model: 'all',
    year: 'all',
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleExport = () => {
    alert(t('export_planned_feature'));
  };

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setIsSheetOpen(false);
  }, []);
  
  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const { state, city, manufacturer, model, year } = filters;
      
      return (
        (state === 'all' || item.state === state) &&
        (city === 'all' || item.city === city) &&
        (manufacturer === 'all' || item.manufacturer === manufacturer) &&
        (model === 'all' || item.model === model) &&
        (year === 'all' || item.year === year)
      );
    });
  }, [initialData, filters]);
  
  const filterOptions = useMemo(() => {
    let dataForOptions = initialData;
    if (filters.state !== 'all') {
      dataForOptions = dataForOptions.filter(item => item.state === filters.state);
    }
    if (filters.manufacturer !== 'all') {
      dataForOptions = dataForOptions.filter(item => item.manufacturer === filters.manufacturer);
    }
    return getFilterOptions(dataForOptions);
  }, [initialData, filters.state, filters.manufacturer]);
  
  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card lg:block">
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
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
                  filterOptions={filterOptions}
                />
            </SheetContent>
          </Sheet>
        </DashboardHeader>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
          <StatCards data={filteredData} />
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <FleetAgeBracketChart data={filteredData} />
          </div>
          <div className="grid gap-4 md:gap-8 lg:grid-cols-1 xl:grid-cols-2">
            <FleetAnalysis 
              data={filteredData}
            />
            <TopModelsChart data={filteredData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardClient;
