
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Vehicle, FilterOptions, Filters, FleetAgeBracket, ChartData, RegionData, AnalysisSnapshot, PredictPartsDemandOutput } from '@/types';
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
import { getRegionData, regionToStatesMap, stateToRegionMap } from '@/lib/regions';
import FleetByYearChart from './dashboard/fleet-by-year-chart';
import PartDemandForecast from './dashboard/part-demand-forecast';
import FinalAnalysis from './dashboard/final-analysis';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { BookCopy, Loader2 } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import html2canvas from 'html2canvas';
import { getFleetData, getFilterOptions } from '@/lib/api-logic';
import { useToast } from '@/hooks/use-toast';

const DashboardClient: FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [allData, setAllData] = useState<Vehicle[]>([]);
  const [filteredData, setFilteredData] = useState<Vehicle[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    regions: [], states: ['RJ', 'SP', 'MG', 'ES'], cities: [], manufacturers: [], models: [], versions: [], years: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    region: '', state: '', city: '', manufacturer: '', model: '', version: [], year: '',
  });

  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);

  const [generalAnalysis, setGeneralAnalysis] = useState<string | null>(null);
  const [demandAnalysis, setDemandAnalysis] = useState<PredictPartsDemandOutput | null>(null);
  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => Array.isArray(value) ? value.length > 0 : value && value !== 'all' && value !== '');
  }, [filters]);


  useEffect(() => {
    const fetchData = async () => {
      if (!isFiltered) {
        setFilteredData([]);
        return;
      }

      setIsLoading(true);
      try {
        const fleetData = await getFleetData(filters);
        setFilteredData(fleetData);
        if (allData.length === 0) {
            const allOptionsData = await getFleetData();
            setAllData(allOptionsData);
        }
      } catch (error) {
        toast({ variant: 'destructive', title: t('error'), description: 'Failed to load fleet data.' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters, isFiltered, toast, t, allData.length]);


  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => {
        const updated = { ...prev, ...newFilters };
        
        // Reset dependent filters on change
        if ('region' in newFilters && newFilters.region !== prev.region) {
          updated.state = '';
          updated.city = '';
        }
        if ('state' in newFilters && newFilters.state !== prev.state) {
            updated.city = '';
        }
        if ('city' in newFilters && newFilters.city !== prev.city) {
            updated.manufacturer = '';
            updated.model = '';
            updated.version = [];
            updated.year = '';
        }
        if ('manufacturer' in newFilters && newFilters.manufacturer !== prev.manufacturer) {
            updated.model = '';
            updated.version = [];
            updated.year = '';
        }
        if ('model' in newFilters && newFilters.model !== prev.model) {
             updated.version = [];
             updated.year = '';
        }
        if ('version' in newFilters && JSON.stringify(newFilters.version) !== JSON.stringify(prev.version)) {
            updated.year = '';
        }

        return updated;
    });
  }, []);
  
  const derivedFilterOptions = useMemo<FilterOptions>(() => {
    const calculateOptions = (key: keyof Vehicle, activeFilters: Partial<Filters>): (string | number)[] => {
        let temp_data = allData;
        
        if (temp_data.length === 0) {
            if (key === 'states') return ['RJ', 'SP', 'MG', 'ES'];
            return [];
        }
        
        if (activeFilters.region && activeFilters.region !== 'all' && key !== 'region') {
            const statesInRegion = regionToStatesMap[activeFilters.region] || [];
            temp_data = temp_data.filter(d => statesInRegion.includes(d.state.toUpperCase()));
        }
        if (activeFilters.state && activeFilters.state !== 'all' && key !== 'state') {
             temp_data = temp_data.filter(d => d.state === activeFilters.state);
        }
        if (activeFilters.city && activeFilters.city !== 'all' && key !== 'city') {
             temp_data = temp_data.filter(d => d.city === activeFilters.city);
        }
        if (activeFilters.manufacturer && activeFilters.manufacturer !== 'all' && key !== 'manufacturer') {
             temp_data = temp_data.filter(d => d.manufacturer === activeFilters.manufacturer);
        }
        if (activeFilters.model && activeFilters.model !== 'all' && key !== 'model') {
             temp_data = temp_data.filter(d => d.model === activeFilters.model);
        }
        if (activeFilters.version && activeFilters.version.length > 0 && key !== 'version') {
             temp_data = temp_data.filter(d => activeFilters.version!.includes(d.version));
        }

        const options = [...new Set(temp_data.map(d => d[key]))] as (string | number)[];
        if (typeof options[0] === 'number') {
            return (options as number[]).sort((a, b) => b - a);
        }
        return (options as string[]).sort();
    };
    
    return {
        regions: [...new Set(allData.map(d => stateToRegionMap[d.state.toUpperCase()]).filter(Boolean))].sort(),
        states: ['RJ', 'SP', 'MG', 'ES'],
        cities: calculateOptions('city', { state: filters.state } as Partial<Filters>) as string[],
        manufacturers: calculateOptions('manufacturer', { state: filters.state, city: filters.city } as Partial<Filters>) as string[],
        models: calculateOptions('model', { state: filters.state, city: filters.city, manufacturer: filters.manufacturer } as Partial<Filters>) as string[],
        versions: calculateOptions('version', { state: filters.state, city: filters.city, manufacturer: filters.manufacturer, model: filters.model } as Partial<Filters>) as string[],
        years: calculateOptions('year', filters) as number[],
    };
  }, [filters, allData]);

  const stateFilteredData = useMemo(() => {
    if (!filters.state || filters.state === 'all') {
      return [];
    }
    return allData.filter(item => item.state === filters.state);
  }, [filters.state, allData]);

  const handleExportPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório de Análise de Frota - Frota.AI', 14, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' }), 14, y);
    y += 15;

    const addSection = (title: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(value, 60, y);
      y += 8;
    };
    
    const stats = {
      totalVehicles: filteredData.reduce((sum, item) => sum + item.quantity, 0).toLocaleString(),
      topCity: Object.keys(filteredData.reduce((acc, item) => {
          acc[item.city] = (acc[item.city] || 0) + item.quantity;
          return acc;
      }, {} as Record<string, number>)).reduce((a, b, _, arr) => arr[a] > arr[b] ? a : b, '-'),
      topModel: Object.keys(filteredData.reduce((acc, item) => {
          const key = item.fullName;
          acc[key] = (acc[key] || 0) + item.quantity;
          return acc;
      }, {} as Record<string, number>)).reduce((a, b, _, arr) => arr[a] > arr[b] ? a : b, '-'),
      topRegion: t(getRegionData(filteredData).reduce((a, b) => a.quantity > b.quantity ? a : b).name as any)
    };


    addSection(t('total_vehicles'), stats.totalVehicles);
    addSection(t('main_city'), stats.topCity);
    addSection(t('main_model'), stats.topModel);
    addSection(t('main_region'), stats.topRegion);
    y += 5;

    const formatTextForPdf = (htmlText: string | null | undefined): string => {
      if (!htmlText) return '';
       const tempDiv = document.createElement('div');
       tempDiv.innerHTML = htmlText.replace(/<\/?[\s\S]*?>/g, "");
       const textContent = (tempDiv.textContent || tempDiv.innerText || "");
       return textContent.replace(/(\\r\\n|\n|\r){2,}/g, '\n\n').trim();
    };

    if (generalAnalysis) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(t('ai_analysis_title'), 14, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const formattedText = formatTextForPdf(generalAnalysis);
      const splitText = doc.splitTextToSize(formattedText, 180);
      doc.text(splitText, 14, y);
      y += (splitText.length * 5) + 10;
    }

    if (demandAnalysis && demandAnalysis.predictions.length > 0) {
        if (y > 200) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(t('part_demand_forecast_title'), 14, y);
        y += 10;

        demandAnalysis.predictions.forEach(pred => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`${pred.partName} (Demanda: ${pred.demandLevel})`, 14, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const reasonText = doc.splitTextToSize(`Razão: ${formatTextForPdf(pred.reason)}`, 180);
            doc.text(reasonText, 14, y);
            y += (reasonText.length * 4) + 2;
            
            const opportunityText = doc.splitTextToSize(`Oportunidade: ${formatTextForPdf(pred.opportunity)}`, 180);
            doc.text(opportunityText, 14, y);
            y += (opportunityText.length * 4) + 8;
        });
    }

    const addBase64ImageToPdf = async (doc: jsPDF, elementId: string, y: number, title: string): Promise<number> => {
      const element = document.getElementById(elementId);
      if (element) {
        const originalBg = element.style.backgroundColor;
        element.style.backgroundColor = '#FFFFFF';

        try {
          const canvas = await html2canvas(element, { 
              scale: 2, 
              useCORS: true, 
              logging: false,
              backgroundColor: '#FFFFFF'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const contentWidth = doc.internal.pageSize.getWidth() - 28;
          const ratio = canvas.width / canvas.height;
          const imgHeight = contentWidth / ratio;

          if (y + imgHeight + 20 > doc.internal.pageSize.getHeight()) {
              doc.addPage();
              y = 20;
          }

          doc.setFontSize(14);
          doc.text(title, 14, y);
          y += 10;
          
          doc.addImage(imgData, 'PNG', 14, y, contentWidth, imgHeight);
          y += imgHeight + 15;
        } catch (error) {
          console.error(`Error capturing element ${elementId}:`, error);
        } finally {
           element.style.backgroundColor = originalBg;
        }
      }
      return y;
  };

    y = await addBase64ImageToPdf(doc, 'regional-chart', y, t('regional_fleet_analysis'));
    y = await addBase64ImageToPdf(doc, 'top-models-chart', y, t('top_models_by_volume', { count: 5 }));
    y = await addBase64ImageToPdf(doc, 'fleet-by-year-chart', y, t('fleet_by_year'));
    y = await addBase64ImageToPdf(doc, 'fleet-age-chart', y, t('fleet_by_age_bracket'));

    doc.save(`frota-ai-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  
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
    if (filters.version.length > 5 && filters.version.length !== derivedFilterOptions.versions.length) {
        setIsVersionLimitModalOpen(true);
        return;
    }
    const totalVehicles = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const snapshot: AnalysisSnapshot = {
      filters: { ...filters },
      totalVehicles, fleetAgeBrackets, regionalData, fleetByYearData,
      availableVersionsCount: derivedFilterOptions.versions.length
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
    if (isLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!isFiltered) {
        return <WelcomePlaceholder />;
    }

    return (
       <>
        <StatCards data={filteredData} stateData={stateFilteredData} filters={filters} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div id="regional-chart">
                <RegionalFleetChart data={regionalData} />
            </div>
            <div id="top-models-chart">
                <TopModelsChart data={filteredData} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div id="fleet-by-year-chart">
            <FleetByYearChart data={filteredData} />
          </div>
          <div id="fleet-age-chart">
            <FleetAgeBracketChart data={filteredData} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <div id="final-analysis-card">
              <FinalAnalysis
                  filters={filters}
                  disabled={!isFiltered || filteredData.length === 0}
                  fleetAgeBrackets={fleetAgeBrackets}
                  regionalData={regionalData}
                  fleetByYearData={fleetByYearData}
                  onAnalysisGenerated={setGeneralAnalysis}
              />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <div id="part-demand-card">
              <PartDemandForecast
                  fleetAgeBrackets={fleetAgeBrackets}
                  filters={filters}
                  disabled={!isFiltered || filteredData.length === 0}
                  onDemandPredicted={setDemandAnalysis}
              />
          </div>
        </div>
      </>
    );
  }


  return (
    <SidebarProvider>
      <Sidebar collapsible="none">
        <DashboardSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={derivedFilterOptions}
        />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader 
          onExport={handleExportPDF} 
          isFiltered={isFiltered}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
             <div className="flex justify-between items-center gap-4">
                <div>
                  {isFiltered && (
                    <Button onClick={handleSaveSnapshot} disabled={!isFiltered || filteredData.length === 0}>
                      <BookCopy className="mr-2 h-4 w-4"/>
                      {t('save_for_comparison')}
                    </Button>
                  )}
                </div>
            </div>

            {isComparing && (
                <ComparisonAnalysis snapshots={snapshots} onClear={handleClearSnapshot} onClearAll={handleClearAllSnapshots} />
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
