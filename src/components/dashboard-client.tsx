
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback } from 'react';
import type { Vehicle, FilterOptions, Filters, FleetAgeBracket } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import TopModelsChart from './dashboard/top-models-chart';
import { useTranslation } from 'react-i18next';
import FleetAgeBracketChart from './dashboard/fleet-age-bracket-chart';
import WelcomePlaceholder from './dashboard/welcome-placeholder';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from '@/components/ui/sidebar';
import RegionalFleetChart from './dashboard/regional-fleet-chart';
import { getRegionData } from '@/lib/regions';
import FilterSuggestions from './dashboard/filter-suggestions';
import FleetQADialog from './dashboard/fleet-qa-dialog';
import FleetByYearChart from './dashboard/fleet-by-year-chart';
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
  const [isQaOpen, setIsQaOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    state: '',
    city: '',
    manufacturer: '',
    model: '',
    version: '',
    year: '',
  });

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        // Reset subsequent filters when a parent filter changes
        if (Object.prototype.hasOwnProperty.call(newFilters, 'state')) {
            updated.city = '';
            updated.manufacturer = '';
            updated.model = '';
            updated.version = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'city')) {
            updated.manufacturer = '';
            updated.model = '';
            updated.version = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'manufacturer')) {
            updated.model = '';
            updated.version = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'model')) {
            updated.version = '';
            updated.year = '';
        }
        if (Object.prototype.hasOwnProperty.call(newFilters, 'version')) {
            updated.year = '';
        }
        return updated;
    });
  }, []);
  
  const filteredData = useMemo(() => {
    if (Object.values(filters).every(f => f === '' || f === 'all')) {
        return [];
    }

    return initialData.filter(item => {
      const { state, city, manufacturer, model, version, year } = filters;

      return (
        (state === 'all' || state === '' || item.state === state) &&
        (city === 'all' || city === '' || item.city === city) &&
        (manufacturer === 'all' || manufacturer === '' || item.manufacturer === manufacturer) &&
        (model === 'all' || model === '' || item.model === model) &&
        (version === 'all' || version === '' || item.version === version) &&
        (year === 'all' || year === '' || item.year === year)
      );
    });
  }, [initialData, filters]);
  
  const filterOptions = useMemo((): FilterOptions => {
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
    
    const models = [...new Set(dataFilteredByManufacturer.map(item => item.model))].sort();

    const dataFilteredByModel = (filters.model && filters.model !== 'all')
        ? dataFilteredByManufacturer.filter(item => item.model === filters.model)
        : dataFilteredByManufacturer;

    const versions = (filters.model && filters.model !== 'all')
        ? [...new Set(dataFilteredByModel.map(item => item.version))].filter(Boolean).sort()
        : [];

    const dataFilteredByVersion = (filters.version && filters.version !== 'all')
        ? dataFilteredByModel.filter(item => item.version === filters.version)
        : dataFilteredByModel;
    
    const years = [...new Set(dataFilteredByVersion.map(item => item.year))].sort((a, b) => b - a);

    return { ...baseOptions, cities, manufacturers, models, versions, years };
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
  
  const regionalData = useMemo(() => getRegionData(filteredData), [filteredData]);


  return (
    <SidebarProvider>
      <Sidebar>
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
        />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader 
          onExport={() => alert(t('export_planned_feature'))} 
          onAskAi={() => setIsQaOpen(true)}
          isFiltered={isFiltered}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
          {!isFiltered ? (
             <div className="flex flex-col h-full gap-8">
               <WelcomePlaceholder />
               <FilterSuggestions onApplyFilters={handleFilterChange} />
             </div>
          ) : (
            <>
              <StatCards data={filteredData} filters={filters} />

               <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <RegionalFleetChart data={regionalData} />
                </div>
                <div className="lg:col-span-2">
                   <TopModelsChart data={filteredData} />
                </div>
              </div>
              <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
                <FleetByYearChart data={filteredData} />
                <FleetAgeBracketChart data={filteredData} />
              </div>
              <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
                 <PartDemandForecast
                    fleetAgeBrackets={fleetAgeBrackets}
                    filters={filters}
                    disabled={!isFiltered || filteredData.length === 0}
                  />
              </div>
            </>
          )}
        </main>
      </SidebarInset>
      <FleetQADialog 
        isOpen={isQaOpen}
        onOpenChange={setIsQaOpen}
        fleetData={filteredData}
        filters={filters}
      />
    </SidebarProvider>
  );
};

export default DashboardClient;
