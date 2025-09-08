
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import type { Vehicle, FilterOptions, Filters } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import TopModelsChart from './dashboard/top-models-chart';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FleetAgeBracketChart from './dashboard/fleet-age-bracket-chart';
import FleetByYearChart from './dashboard/sales-over-time-chart';
import FleetQADialog from './dashboard/fleet-qa-dialog';
import FilterSuggestions from './dashboard/filter-suggestions';

interface DashboardClientProps {
  initialData: Vehicle[];
}

const getBaseFilterOptions = (data: Vehicle[]): Pick<FilterOptions, 'states'> => {
  const states = [...new Set(data.map(item => item.state))].sort();
  return { states };
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
  const [isQADialogOpen, setIsQADialogOpen] = useState(false);

  const handleExport = () => {
    alert(t('export_planned_feature'));
  };

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        // Reset dependent filters
        if ('state' in newFilters) {
            updated.city = 'all';
        }
        if ('manufacturer' in newFilters) {
            updated.model = 'all';
        }
        // Always reset year if other filters change, to ensure consistency
        if (Object.keys(newFilters).some(k => k !== 'year')) {
            updated.year = 'all';
        }
        return updated;
    });
    if(Object.keys(newFilters).length === 1 && Object.keys(newFilters)[0] !== 'year'){
       setIsSheetOpen(false);
    }
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
    const baseOptions = getBaseFilterOptions(initialData);

    const dataFilteredForOptions = initialData.filter(item => 
        (filters.state === 'all' || item.state === filters.state) &&
        (filters.city === 'all' || item.city === filters.city) &&
        (filters.manufacturer === 'all' || item.manufacturer === filters.manufacturer) &&
        (filters.model === 'all' || item.model === filters.model)
    );
    
    const cities = filters.state === 'all' 
        ? [] 
        : [...new Set(initialData.filter(item => item.state === filters.state).map(item => item.city))].sort();

    const dataFilteredByLocation = initialData.filter(item => 
        (filters.state === 'all' || item.state === filters.state) &&
        (filters.city === 'all' || item.city === filters.city)
    );
    
    const manufacturers = [...new Set(dataFilteredByLocation.map(item => item.manufacturer))].sort();

    const dataFilteredByManufacturer = dataFilteredByLocation.filter(item => 
        filters.manufacturer === 'all' || item.manufacturer === filters.manufacturer
    );

    const models = filters.manufacturer === 'all'
        ? []
        : [...new Set(dataFilteredByManufacturer.map(item => item.model))].sort();
    
    const years = [...new Set(dataFilteredForOptions.map(item => item.year))].sort((a, b) => b - a);

    return { ...baseOptions, cities, manufacturers, models, years };
  }, [initialData, filters.state, filters.city, filters.manufacturer, filters.model]);

  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => value !== 'all');
  }, [filters]);

  return (
    <>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-card lg:block">
          <DashboardSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
          />
        </div>
        <div className="flex flex-col">
          <DashboardHeader 
            onExport={handleExport} 
            onAskAi={() => setIsQADialogOpen(true)}
            isFiltered={isFiltered}
          >
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
            <StatCards data={filteredData} filters={filters} />
            <div className="border rounded-lg p-6 bg-card shadow-sm">
             <FilterSuggestions onApplyFilters={handleFilterChange} />
            </div>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <FleetByYearChart data={filteredData} />
              </div>
              <FleetAgeBracketChart data={filteredData} />
            </div>
             <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                 <TopModelsChart data={filteredData} />
              </div>
              <div className="lg:col-span-1">
                 {/* Placeholder for a future chart */}
              </div>
            </div>
          </main>
        </div>
      </div>
      <FleetQADialog
        isOpen={isQADialogOpen}
        onOpenChange={setIsQADialogOpen}
        fleetData={filteredData}
        filters={filters}
      />
    </>
  );
};

export default DashboardClient;
