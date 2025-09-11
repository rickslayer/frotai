
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
import { BookCopy, Loader2, ServerCrash } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Skeleton } from './ui/skeleton';


const DashboardClient: FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<Vehicle[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
      states: [], cities: [], manufacturers: [], models: [], versions: [], years: []
  });
  const [filters, setFilters] = useState<Filters>({
    state: '', city: '', manufacturer: '', model: '', version: [], year: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);

  const dashboardContentRef = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);


  const fetchDataAndOptions = useCallback(async (currentFilters: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            if (value.length > 0) query.append(key, value.join(','));
          } else {
            query.append(key, String(value));
          }
        }
      });
      
      const [dataRes, optionsRes] = await Promise.all([
        fetch(`/api/fleet-data?${query.toString()}`),
        fetch(`/api/filter-options?${query.toString()}`)
      ]);

      if (!dataRes.ok || !optionsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [fleetData, newOptions] = await Promise.all([
        dataRes.json(),
        optionsRes.json()
      ]);

      setData(fleetData);
      
      setFilterOptions(prevOptions => ({
        states: newOptions.states.length ? newOptions.states : prevOptions.states,
        manufacturers: newOptions.manufacturers.length ? newOptions.manufacturers : prevOptions.manufacturers,
        years: newOptions.years.length ? newOptions.years : prevOptions.years,
        cities: newOptions.cities,
        models: newOptions.models,
        versions: newOptions.versions,
      }));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setLoading(false);
      initialLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDataAndOptions(filters);
  }, [filters, fetchDataAndOptions]);


  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        // Cascade filter clearing
        if (newFilters.state !== undefined && newFilters.state !== prev.state) {
            updated.city = '';
        }
        if (newFilters.manufacturer !== undefined && newFilters.manufacturer !== prev.manufacturer) {
            updated.model = '';
            updated.version = [];
        }
        if (newFilters.model !== undefined && newFilters.model !== prev.model) {
            updated.version = [];
        }
        return updated;
    });
  }, []);

  const handleExportPDF = () => {
    const input = dashboardContentRef.current;
    if (!input) return;

    document.body.classList.add('exporting-pdf');

    html2canvas(input, {
        scale: 2, useCORS: true, logging: false,
        onclone: (document) => {
            document.getElementById('export-button')?.remove();
            document.getElementById('compare-button')?.remove();
        }
    }).then(canvas => {
        document.body.classList.remove('exporting-pdf');
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const ratio = canvas.width / canvas.height;
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
  
  const filteredData = data;

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
    return Object.entries(brackets).map(([range, data]) => ({ range, label: data.label, quantity: data.total }));
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
      totalVehicles, fleetAgeBrackets, regionalData, fleetByYearData,
      availableVersionsCount: filterOptions.versions.length
    };
    setSnapshots(prev => {
      if (!prev[0]) return [snapshot, prev[1]];
      if (!prev[1]) return [prev[0], snapshot];
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

  const renderContent = () => {
    if (loading && initialLoad.current) {
      return (
        <div className="grid h-full w-full place-items-center">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-lg">Carregando dados...</p>
            </div>
        </div>
      )
    }

    if (error) {
       return (
        <div className="grid h-full w-full place-items-center">
            <div className="flex flex-col items-center gap-4 text-destructive">
                <ServerCrash className="h-16 w-16" />
                <h2 className="text-2xl font-bold">Erro ao carregar os dados</h2>
                <p className="text-center">Não foi possível conectar à fonte de dados. Por favor, tente recarregar a página.<br/>Se o problema persistir, entre em contato com o suporte.</p>
                <Button onClick={() => fetchDataAndOptions(filters)}>Tentar Novamente</Button>
            </div>
        </div>
       )
    }
    
    if (!isFiltered) {
        return <WelcomePlaceholder />;
    }

    return (
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
    );
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
            {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardClient;
