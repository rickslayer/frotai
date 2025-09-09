
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
import WelcomePlaceholder from './dashboard/welcome-placeholder';

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
    state: '',
    city: '',
    manufacturer: '',
    model: '',
    year: '',
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        if (Object.prototype.hasOwnProperty.call(newFilters, 'state')) {
            updated.city = '';
            updated.manufacturer = '';
            updated.model = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'city')) {
            updated.manufacturer = '';
            updated.model = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'manufacturer')) {
            updated.model = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'model')) {
            updated.year = '';
        }
        return updated;
    });
    if(Object.keys(newFilters).length > 1 || !['year', 'manufacturer'].includes(Object.keys(newFilters)[0])){
       setIsSheetOpen(false);
    }
  }, []);
  
  const filteredData = useMemo(() => {
    // Se nenhum filtro estiver selecionado, não retorna nenhum dado.
    if (Object.values(filters).every(f => f === '' || f === 'all')) {
        return [];
    }

    return initialData.filter(item => {
      const { state, city, manufacturer, model, year } = filters;
      
      return (
        (state === 'all' || state === '' || item.state === state) &&
        (city === 'all' || city === '' || item.city === city) &&
        (manufacturer === 'all' || manufacturer === '' || item.manufacturer === manufacturer) &&
        (model === 'all' || model === '' || item.model === model) &&
        (year === 'all' || year === '' || item.year === year)
      );
    });
  }, [initialData, filters]);
  
  const filterOptions = useMemo(() => {
    const baseOptions = getBaseFilterOptions(initialData);

    const dataFilteredByState = (filters.state && filters.state !== 'all')
        ? initialData.filter(item => item.state === filters.state)
        : initialData;
    
    const cities = (filters.state && filters.state !== 'all')
        ? [...new Set(dataFilteredByState.map(item => item.city))].sort()
        : [];

    const dataFilteredByCity = (filters.city && filters.city !== 'all')
        ? dataFilteredByState.filter(item => item.city === filters.city)
        : dataFilteredByState;

    const manufacturers = [...new Set(dataFilteredByCity.map(item => item.manufacturer))].sort();

    const dataFilteredByManufacturer = (filters.manufacturer && filters.manufacturer !== 'all')
        ? dataFilteredByCity.filter(item => item.manufacturer === filters.manufacturer)
        : dataFilteredByCity;
    
    const models = (filters.manufacturer && filters.manufacturer !== 'all')
        ? [...new Set(dataFilteredByManufacturer.map(item => item.model))].sort()
        : [];

    const dataFilteredByModel = (filters.model && filters.model !== 'all')
        ? dataFilteredByManufacturer.filter(item => item.model === filters.model)
        : dataFilteredByManufacturer;
    
    const years = [...new Set(dataFilteredByModel.map(item => item.year))].sort((a, b) => b - a);

    return { ...baseOptions, cities, manufacturers, models, years };
  }, [initialData, filters]);

  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => value !== '' && value !== 'all');
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
          <DashboardHeader onExport={() => alert(t('export_planned_feature'))} />
          <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
            {isFiltered ? (
              <>
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
              </>
            ) : (
              <WelcomePlaceholder />
            )}
          </main>
        </div>
      </div>
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 lg:hidden fixed top-3 left-4 z-50">
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
    </>
  );
};

export default DashboardClient;
