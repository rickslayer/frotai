
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import type { FilterOptions, Filters, DashboardData, AnalysisSnapshot, PredictPartsDemandOutput } from '@/types';
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
import RegionalFleetAnalysis from './dashboard/regional-fleet-analysis';
import FleetByYearChart from './dashboard/fleet-by-year-chart';
import PartDemandForecast from './dashboard/part-demand-forecast';
import FinalAnalysis from './dashboard/final-analysis';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { BookCopy, Loader2 } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import html2canvas from 'html2canvas';
import { getFleetData, getInitialFilterOptions } from '@/lib/api-logic';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';


const emptyDashboardData: DashboardData = {
  totalVehicles: 0,
  topModel: { name: '-', quantity: 0 },
  topManufacturer: { name: '-', quantity: 0 },
  topRegion: undefined,
  topState: undefined,
  topCity: undefined,
  regionalData: [],
  topModelsChart: [],
  fleetByYearChart: [],
  fleetAgeBrackets: [],
};

const initialFilters: Filters = {
    region: '', state: '', city: '',
    manufacturer: '', model: [], version: [], year: '',
};

const emptyFilterOptions: FilterOptions = {
    regions: [], states: [], cities: [],
    manufacturers: [], models: [], versions: [], years: [],
};

const DashboardClient: FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(emptyFilterOptions);

  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);

  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);
  
  const [generalAnalysis, setGeneralAnalysis] = useState<string | null>(null);
  const [demandAnalysis, setDemandAnalysis] = useState<PredictPartsDemandOutput | null>(null);
  const [highlightedFilters, setHighlightedFilters] = useState<Array<keyof Filters>>([]);
  
  const isSearchEnabled = useMemo(() => {
    const { region, state, manufacturer, model, year } = debouncedFilters;
    // Path 1: Focused on Location
    const locationPath = region && state && (year || model.length > 0);
    // Path 2: Focused on Vehicle
    const vehiclePath = manufacturer && region && model.length > 0;
    return locationPath || vehiclePath;
  }, [debouncedFilters]);
  
  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value && value !== '';
    });
  }, [filters]);
  
  const disabledFilters = useMemo(() => ({
    model: !filters.manufacturer,
    version: filters.model.length === 0,
    state: !filters.region,
    city: !filters.state
  }), [filters]);

  // Effect for initial data load (only filter options)
  useEffect(() => {
    const fetchInitialOptions = async () => {
      setIsLoading(true);
      try {
        const options = await getInitialFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load initial data.';
        toast({ variant: 'destructive', title: t('error'), description: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialOptions();
  }, [t, toast]);


  // Effect for fetching DASHBOARD DATA based on DEBOUNCED filters
  useEffect(() => {
    if (!isSearchEnabled) {
      setDashboardData(emptyDashboardData);
      return;
    }

    const fetchData = async () => {
      startTransition(async () => {
        try {
          const data = await getFleetData(debouncedFilters);
          setDashboardData(data);
        } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: t('error'), description: 'Failed to load dashboard data.' });
          setDashboardData(emptyDashboardData);
        }
      });
    };

    fetchData();
  }, [debouncedFilters, isSearchEnabled, toast]);


  // Effect for fetching FILTER OPTIONS immediately when a filter changes
  useEffect(() => {
    if (isLoading) return;

    const fetchOptions = async () => {
        try {
            const options = await getInitialFilterOptions(filters);
            setFilterOptions(prev => ({
                // Preserve previous options to avoid flickering, but clear children when a parent changes.
                regions: options.regions?.length > 0 ? options.regions : prev.regions,
                states: filters.region ? (options.states ?? []) : [],
                cities: filters.state ? (options.cities ?? []) : [],
                manufacturers: options.manufacturers?.length > 0 ? options.manufacturers : prev.manufacturers,
                models: filters.manufacturer ? (options.models ?? []) : [],
                versions: filters.model.length > 0 ? (options.versions ?? []) : [],
                years: options.years?.length > 0 ? options.years : prev.years,
            }));
        } catch (error) {
             console.error('Failed to fetch dynamic filter options:', error);
             toast({ variant: 'destructive', title: t('error'), description: 'Failed to update filter options.' });
        }
    };
    
    fetchOptions();

  }, [filters, isLoading, toast]);


  const handleFilterChange = useCallback((key: keyof Filters, value: any) => {
    setFilters(prev => {
        const updated: Filters = { ...prev };
        const finalValue = value === 'all' ? '' : value;
        
        updated[key] = finalValue;

        // --- Cascading Logic ---
        if (key === 'region') {
            updated.state = '';
            updated.city = '';
        }
        if (key === 'state') {
            updated.city = '';
        }
        
        if (key === 'manufacturer') {
            updated.model = [];
            updated.version = [];
        }
        if (key === 'model') {
            updated.version = [];
        }
        
        if (key === 'year' && finalValue !== '') {
            updated.year = Number(finalValue);
        } else if (key === 'year' && finalValue === '') {
            updated.year = '';
        }

        return updated;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(initialFilters);
    setDashboardData(emptyDashboardData);
  }, []);
  
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
    
    addSection(t('total_vehicles'), dashboardData.totalVehicles.toLocaleString());
    addSection(t('main_manufacturer'), dashboardData.topManufacturer?.name || '-');
    addSection(t('main_model'), dashboardData.topModel.name);
    addSection(t('main_city'), dashboardData.topCity?.name || '-');
    y += 5;

    const formatTextForPdf = (htmlText: string | null | undefined): string => {
        if (!htmlText) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n**$1**\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '  - $1\n')
            .replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

        return (tempDiv.textContent || tempDiv.innerText || "").replace(/(\n){3,}/g, '\n\n').trim();
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

    y = await addBase64ImageToPdf(doc, 'regional-analysis-chart', y, t('regional_fleet_analysis'));
    y = await addBase64ImageToPdf(doc, 'top-models-chart', y, t('top_models_by_volume', { count: 5 }));
    y = await addBase64ImageToPdf(doc, 'fleet-by-year-chart', y, t('fleet_by_year'));
    y = await addBase64ImageToPdf(doc, 'fleet-age-chart', y, t('fleet_by_age_bracket'));

    doc.save(`frota-ai-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const fleetAgeBracketsWithLabels = useMemo(() => {
    const bracketLabels: Record<string, string> = {
      '0-3': t('age_bracket_new'),
      '4-7': t('age_bracket_semi_new'),
      '8-12': t('age_bracket_used'),
      '13+': t('age_bracket_old'),
    };
    return (dashboardData.fleetAgeBrackets || []).map(bracket => ({
      ...bracket,
      label: bracketLabels[bracket.range] || bracket.range
    }));
  }, [dashboardData.fleetAgeBrackets, t]);
  
  const handleSaveSnapshot = () => {
    if (filters.version.length > 5 && filters.version.length !== filterOptions.versions.length) {
        setIsVersionLimitModalOpen(true);
        return;
    }
    const snapshot: AnalysisSnapshot = {
      filters: { ...filters },
      totalVehicles: dashboardData.totalVehicles, 
      fleetAgeBrackets: fleetAgeBracketsWithLabels, 
      regionalData: dashboardData.regionalData,
      fleetByYearData: dashboardData.fleetByYearChart.map(d => ({ name: String(d.year), quantity: d.quantity })),
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

  const getWelcomeTitleAndHighlights = (): { titleKey: string, highlights: (keyof Filters)[] } => {
    const { region, state, manufacturer, model } = filters;
    
    // Vehicle path advanced, needs model
    if (manufacturer && region && model.length === 0) {
        return { titleKey: 'welcome_title_vehicle_needs_model', highlights: ['model'] };
    }

    // Location path advanced, needs vehicle details
    if (region && state && model.length === 0 && !filters.year) {
         return { titleKey: 'welcome_title_location_needs_vehicle_details', highlights: ['model', 'year'] };
    }

    // Location path started
    if (region && !manufacturer && !state) {
        return { titleKey: 'welcome_title_location_needs_state', highlights: ['state', 'manufacturer'] };
    }
    
    // Vehicle path started
    if (manufacturer && !region) {
        return { titleKey: 'welcome_title_vehicle_needs_region', highlights: ['region'] };
    }

    // No filters selected
    if (!region && !manufacturer) {
        return { titleKey: 'welcome_title_start', highlights: ['region', 'manufacturer'] };
    }

    // Default if no specific guidance is needed but search is not yet enabled
    return { titleKey: 'welcome_title_start', highlights: [] };
  }
  
  useEffect(() => {
    if (!isSearchEnabled) {
      const { highlights } = getWelcomeTitleAndHighlights();
      setHighlightedFilters(highlights);
    } else {
      setHighlightedFilters([]);
    }
  }, [filters, isSearchEnabled]);

  const { titleKey: welcomeTitleKey } = getWelcomeTitleAndHighlights();

  const renderContent = () => {
    if (isLoading && !isPending) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (!isSearchEnabled) {
        return <WelcomePlaceholder titleKey={welcomeTitleKey} />;
    }
    
    if (isPending) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
       <>
        <StatCards data={dashboardData} isLoading={isPending} />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-8">
            <div id="regional-analysis-chart" className="lg:col-span-3">
                <RegionalFleetAnalysis 
                    data={dashboardData.regionalData} 
                    total={dashboardData.totalVehicles} 
                    selectedRegion={filters.region}
                />
            </div>
            <div id="top-models-chart" className="lg:col-span-2">
                <TopModelsChart data={dashboardData.topModelsChart} topManufacturer={dashboardData.topManufacturer} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
          <div id="fleet-by-year-chart">
            <FleetByYearChart data={dashboardData.fleetByYearChart} />
          </div>
          <div id="fleet-age-chart">
            <FleetAgeBracketChart data={dashboardData.fleetAgeBrackets} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <div id="final-analysis-card">
              <FinalAnalysis
                  filters={filters}
                  disabled={dashboardData.totalVehicles === 0}
                  fleetAgeBrackets={fleetAgeBracketsWithLabels}
                  regionalData={dashboardData.regionalData}
                  fleetByYearData={dashboardData.fleetByYearChart.map(d => ({ name: String(d.year), quantity: d.quantity }))}
                  onAnalysisGenerated={setGeneralAnalysis}
              />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-8">
          <div id="part-demand-card">
              <PartDemandForecast
                  fleetAgeBrackets={fleetAgeBracketsWithLabels}
                  filters={filters}
                  disabled={dashboardData.totalVehicles === 0 || !filters.manufacturer || filters.model.length !== 1}
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
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
          disabledFilters={disabledFilters}
          highlightedFilters={highlightedFilters}
        />
      </Sidebar>
      <SidebarInset>
        <DashboardHeader 
          onExport={handleExportPDF} 
          isFiltered={isFiltered && dashboardData.totalVehicles > 0}
        />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-muted/20">
             <div className="flex justify-between items-center gap-4">
                <div>
                  {isFiltered && (
                    <Button onClick={handleSaveSnapshot} disabled={!isFiltered || dashboardData.totalVehicles === 0}>
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
