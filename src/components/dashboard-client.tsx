
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import type { Vehicle, FilterOptions, Filters, FleetAgeBracket } from '@/types';
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
import PartDemandForecast from './dashboard/part-demand-forecast';

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

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        if (Object.prototype.hasOwnProperty.call(newFilters, 'state')) {
            updated.city = 'all';
            updated.manufacturer = 'all';
            updated.model = 'all';
            updated.year = 'all';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'city')) {
            updated.manufacturer = 'all';
            updated.model = 'all';
            updated.year = 'all';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'manufacturer')) {
            updated.model = 'all';
            updated.year = 'all';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'model')) {
            updated.year = 'all';
        }
        return updated;
    });
    if(Object.keys(newFilters).length > 1 || !['year', 'manufacturer'].includes(Object.keys(newFilters)[0])){
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

    const dataFilteredByState = initialData.filter(item => 
        (filters.state === 'all' || item.state === filters.state)
    );
    
    const cities = filters.state === 'all' 
        ? [] 
        : [...new Set(dataFilteredByState.map(item => item.city))].sort();

    const dataFilteredByCity = dataFilteredByState.filter(item =>
        (filters.city === 'all' || item.city === filters.city)
    );

    const manufacturers = [...new Set(dataFilteredByCity.map(item => item.manufacturer))].sort();

    const dataFilteredByManufacturer = dataFilteredByCity.filter(item => 
        (filters.manufacturer === 'all' || item.manufacturer === filters.manufacturer)
    );

    const models = filters.manufacturer === 'all'
        ? []
        : [...new Set(dataFilteredByManufacturer.map(item => item.model))].sort();

    const dataFilteredByModel = dataFilteredByManufacturer.filter(item =>
        (filters.model === 'all' || item.model === filters.model)
    );
    
    const years = [...new Set(dataFilteredByModel.map(item => item.year))].sort((a, b) => b - a);

    return { ...baseOptions, cities, manufacturers, models, years };
  }, [initialData, filters]);

  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => value !== 'all');
  }, [filters]);

  const fleetAgeBrackets = useMemo((): FleetAgeBracket[] => {
    const currentYear = new Date().getFullYear();
    const brackets = {
      '0-3': { label: t('age_bracket_new'), total: 0 },
      '4-7': { label: t('age_bracket_semi_new'), total: 0 },
      '8-12': { label: t('age_bracket_used'), total: 0 },
      '13+': { label: t('age_bracket_old'), total: 0 },
    };

    filteredData.forEach(item => {
      const age = currentYear - item.year;
      if (age >= 0 && age <= 3) brackets['0-3'].total += item.quantity;
      else if (age >= 4 && age <= 7) brackets['4-7'].total += item.quantity;
      else if (age >= 8 && age <= 12) brackets['8-12'].total += item.quantity;
      else if (age >= 13) brackets['13+'].total += item.quantity;
    });

    return Object.entries(brackets).map(([range, data]) => ({
      range,
      label: data.label,
      quantity: data.total,
    }));
  }, [filteredData, t]);


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
          <DashboardHeader onExport={() => alert(t('export_planned_feature'))}>
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
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
              <FleetByYearChart data={filteredData} />
              <FleetAgeBracketChart data={filteredData} />
            </div>
             <div className="grid gap-4 md:gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                 <TopModelsChart data={filteredData} />
              </div>
              <div className="lg:col-span-1">
                 <PartDemandForecast
                    fleetAgeBrackets={fleetAgeBrackets}
                    filters={filters}
                    disabled={!isFiltered || filteredData.length === 0}
                  />
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardClient;
