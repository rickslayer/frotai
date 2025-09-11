
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useRef } from 'react';
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
import { BookCopy } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface DashboardClientProps {
  initialData: Vehicle[];
  initialFilterOptions: FilterOptions;
}

const DashboardClient: FC<DashboardClientProps> = ({ initialData, initialFilterOptions }) => {
  const { t } = useTranslation();
  const [allData] = useState<Vehicle[]>(initialData);
  
  const [filters, setFilters] = useState<Filters>({
    state: '', city: '', manufacturer: '', model: '', version: [], year: '',
  });

  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);

  const dashboardContentRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        
        // Cascade filter clearing
        if ('state' in newFilters) {
            updated.city = '';
        }
        if ('manufacturer' in newFilters) {
            updated.model = '';
            updated.version = [];
        }
        if ('model' in newFilters) {
             updated.version = [];
        }

        return updated;
    });
  }, []);

  const filterOptions = useMemo<FilterOptions>(() => {
    let filteredForOptions = allData;

    if (filters.state && filters.state !== 'all') {
      filteredForOptions = filteredForOptions.filter(d => d.state === filters.state);
    }
    const cities = [...new Set(filteredForOptions.map(d => d.city))].sort();

    if (filters.manufacturer && filters.manufacturer !== 'all') {
        filteredForOptions = filteredForOptions.filter(d => d.manufacturer === filters.manufacturer);
    }
    const models = [...new Set(filteredForOptions.map(d => d.model))].sort();

    if (filters.model && filters.model !== 'all') {
        filteredForOptions = filteredForOptions.filter(d => d.model === filters.model);
    }
    const versions = [...new Set(filteredForOptions.map(d => d.version))].sort();

    return {
      ...initialFilterOptions,
      cities,
      models,
      versions,
    };
  }, [filters, allData, initialFilterOptions]);

  const filteredData = useMemo(() => {
    const hasFilters = Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value && value !== 'all');
    if (!hasFilters) {
        return [];
    }

    return allData.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === '' || value === 'all' || (Array.isArray(value) && value.length === 0)) {
                return true;
            }
            if (key === 'year') {
                return item.year === Number(value);
            }
            const itemValue = item[key as keyof Vehicle];
            if (Array.isArray(value)) {
                return value.includes(itemValue as string);
            }
            return String(itemValue).toLowerCase() === String(value).toLowerCase();
        });
    });
  }, [filters, allData]);

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
    return Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value && value !== 'all');
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
    return Object.entries(brackets).map(([range, data]) => ({ range, label: data.label, quantity: data.total }));
  }, [filteredData, t]);
  
  const regionalData = useMemo(() => getRegionData(filteredData, allData), [filteredData, allData]);

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
