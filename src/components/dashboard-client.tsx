
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { Vehicle, FilterOptions, Filters, FleetAgeBracket, ChartData, RegionData, AnalysisSnapshot } from '@/types';
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
import FleetByYearChart from './dashboard/fleet-by-year-chart';
import PartDemandForecast from './dashboard/part-demand-forecast';
import FinalAnalysis from './dashboard/final-analysis';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from './ui/button';
import { BookCopy, Loader2 } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


async function fetchApi(url: string) {
    const res = await fetch(url);
    if (!res.ok) {
        const errorBody = await res.text();
        console.error(`API Error Response Body for ${url}:`, errorBody);
        throw new Error(`Failed to fetch ${url}`);
    }
    return res.json();
}

const buildQueryString = (filters: Partial<Filters>): string => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
            if (Array.isArray(value)) {
                if (value.length > 0) params.append(key, value.join(','));
            } else {
                 params.append(key, String(value));
            }
        }
    });
    return params.toString();
}

const getFleetData = (filters: Filters): Promise<Vehicle[]> => {
    const queryString = buildQueryString(filters);
    return fetchApi(`/api/vehicles?${queryString}`);
};

const getFilterOptions = (filters: Partial<Filters>): Promise<FilterOptions> => {
    const queryString = buildQueryString(filters);
    return fetchApi(`/api/filter-options?${queryString}`);
};


interface DashboardClientProps {
  // No initial data needed anymore
}

const DashboardClient: FC<DashboardClientProps> = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    state: '',
    city: '',
    manufacturer: '',
    model: '',
    version: [],
    year: '',
  });

  const [filteredData, setFilteredData] = useState<Vehicle[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
      states: [],
      cities: [],
      manufacturers: [],
      models: [],
      versions: [],
      years: [],
  });
  const [loading, setLoading] = useState(true);
  
  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);

  const dashboardContentRef = useRef<HTMLDivElement>(null);

  const fetchDataAndOptions = useCallback(async (currentFilters: Filters, filterKeyChanged?: keyof Filters) => {
    setLoading(true);
    const hasActiveFilter = Object.values(currentFilters).some(v => (Array.isArray(v) ? v.length > 0 : v && v !== 'all'));
    
    try {
      const dataPromise = hasActiveFilter ? getFleetData(currentFilters) : Promise.resolve([]);
      const optionsPromise = getFilterOptions(currentFilters);
      
      const [data, options] = await Promise.all([dataPromise, optionsPromise]);

      setFilteredData(data);
      setFilterOptions(prevOptions => ({
        states: options.states.length > 0 ? options.states : prevOptions.states,
        cities: options.cities,
        manufacturers: options.manufacturers,
        models: options.models,
        versions: options.versions,
        years: options.years,
      }));

    } catch (error) {
      console.error('Failed to fetch data:', error);
       toast({
            variant: 'destructive',
            title: t('error'),
            description: "Failed to fetch data. Please try again.",
        });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  // Fetch initial filter options (states) on component mount
  useEffect(() => {
    const fetchInitialOptions = async () => {
        setLoading(true);
        try {
            const options = await getFilterOptions({});
            setFilterOptions(options);
        } catch (error) {
            console.error("Error fetching filter options from API:", (error as Error).message);
            toast({
                variant: 'destructive',
                title: t('error'),
                description: "Failed to load initial data. Please refresh.",
            });
        } finally {
            setLoading(false);
        }
    };
    fetchInitialOptions();
  }, [t, toast]);


  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    const updated = { ...filters, ...newFilters };
    const changedKey = Object.keys(newFilters)[0] as keyof Filters;
    
    if (changedKey === 'state') {
        updated.city = '';
        updated.manufacturer = '';
        updated.model = '';
        updated.version = [];
        updated.year = '';
    }
    if (changedKey === 'city') {
        updated.manufacturer = '';
        updated.model = '';
        updated.version = [];
        updated.year = '';
    }
    if (changedKey === 'manufacturer') {
        updated.model = '';
        updated.version = [];
        updated.year = '';
    }
    if (changedKey === 'model') {
        updated.version = [];
        updated.year = '';
    }
    if (changedKey === 'version') {
        updated.year = '';
    }
    
    setFilters(updated);
    fetchDataAndOptions(updated, changedKey);
  }, [filters, fetchDataAndOptions]);

  const handleExportPDF = () => {
    const input = dashboardContentRef.current;
    if (!input) return;

    document.body.classList.add('exporting-pdf');

    html2canvas(input, {
        scale: 2, 
        useCORS: true,
        logging: false,
        onclone: (document) => {
            const exportButton = document.getElementById('export-button');
            if (exportButton) exportButton.style.display = 'none';
            const compareButton = document.getElementById('compare-button');
            if (compareButton) compareButton.style.display = 'none';
        }
    }).then(canvas => {
        document.body.classList.remove('exporting-pdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth;
        let height = width / ratio;

        pdf.addImage(imgData, 'PNG', 0, 0, width, height > pdfHeight ? pdfHeight : height);

        pdf.save(`frota-ai-report-${new Date().toISOString().slice(0,10)}.pdf`);
    }).catch(() => {
         document.body.classList.remove('exporting-pdf');
    });
  };
  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value !== '' && value !== 'all');
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

  const fleetByYearData = useMemo(() => {
    const yearlyFleet = filteredData.reduce((acc, item) => {
      acc[item.year] = (acc[item.year] || 0) + item.quantity;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(yearlyFleet)
      .map(([year, quantity]) => ({ name: year, quantity }))
      .sort((a, b) => Number(a.name) - Number(b.name));
  }, [filteredData]);

  const handleSaveSnapshot = () => {
    if (filters.version.length > 5 && filters.version.length !== filterOptions.versions.length) {
        setIsVersionLimitModalOpen(true);
        return;
    }

    const totalVehicles = filteredData.reduce((sum, item) => sum + item.quantity, 0);

    const snapshot: AnalysisSnapshot = {
      filters: { ...filters },
      totalVehicles,
      fleetAgeBrackets,
      regionalData,
      fleetByYearData,
      availableVersionsCount: filterOptions.versions.length
    };
    
    setSnapshots(prev => {
      if (!prev[0]) {
        return [snapshot, prev[1]];
      }
      if (!prev[1]) {
        return [prev[0], snapshot];
      }
      return [prev[0], snapshot];
    });
    setIsComparing(true);
  };
  
  const handleClearSnapshot = (index: 0 | 1) => {
    setSnapshots(prev => {
        const newSnapshots = [...prev] as [AnalysisSnapshot | null, AnalysisSnapshot | null];
        newSnapshots[index] = null;
        if (newSnapshots[0] === null && newSnapshots[1] === null) {
            setIsComparing(false);
        }
        return newSnapshots;
    });
  };

  const handleClearAllSnapshots = () => {
      setSnapshots([null, null]);
      setIsComparing(false);
  }


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
          onExport={handleExportPDF} 
          isFiltered={isFiltered}
        />
        <main ref={dashboardContentRef} className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
           {isComparing && (
            <div className="mb-4">
              <ComparisonAnalysis snapshots={snapshots} onClear={handleClearSnapshot} onClearAll={handleClearAllSnapshots} />
            </div>
           )}

            <AlertDialog open={isVersionLimitModalOpen} onOpenChange={setIsVersionLimitModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{t('attention_title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('version_limit_error', { limit: 5 })}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setIsVersionLimitModalOpen(false)}>
                        {t('ok_close')}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>


          {loading ? (
             <div className="flex flex-1 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : !isFiltered ? (
             <div className="flex flex-col h-full gap-8">
               <WelcomePlaceholder />
             </div>
          ) : (
            <>
              <div className='flex justify-end'>
                 <Button id="compare-button" onClick={handleSaveSnapshot} disabled={!isFiltered || filteredData.length === 0}>
                    <BookCopy className="mr-2 h-4 w-4"/>
                    {t('save_for_comparison')}
                </Button>
              </div>

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
                 <FinalAnalysis
                    filters={filters}
                    disabled={!isFiltered || filteredData.length === 0}
                    fleetAgeBrackets={fleetAgeBrackets}
                    regionalData={regionalData}
                    fleetByYearData={fleetByYearData}
                  />
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
    </SidebarProvider>
  );
};

export default DashboardClient;

    