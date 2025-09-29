
'use client';

import type { FC } from 'react';
import React, { useState, useMemo, useCallback, useEffect, useTransition } from 'react';
import type { FilterOptions, Filters, DashboardData, AnalysisSnapshot, PredictPartsDemandOutput, AnswerFleetQuestionOutput } from '@/types';
import DashboardHeader from '@/components/dashboard/header';
import DashboardSidebar from '@/components/dashboard/sidebar';
import StatCards from './dashboard/stat-cards';
import { useTranslation } from 'react-i18next';
import WelcomePlaceholder from './dashboard/welcome-placeholder';
import RegionalFleetAnalysis from './dashboard/regional-fleet-analysis';
import TopModelsChart from './dashboard/top-models-chart';
import FleetByYearChart from './dashboard/fleet-by-year-chart';
import PartDemandForecast from './dashboard/part-demand-forecast';
import FinalAnalysis from './dashboard/final-analysis';
import jsPDF from 'jspdf';
import { Button } from './ui/button';
import { AlertCircle, BookCopy, Loader2 } from 'lucide-react';
import ComparisonAnalysis from './dashboard/comparison-analysis';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import html2canvas from 'html2canvas';
import { getFleetData, getInitialFilterOptions } from '@/lib/api-logic';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce';
import FleetAgeBracketChart from './dashboard/fleet-age-bracket-chart';
import { SidebarProvider } from './ui/sidebar';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


const emptyDashboardData: DashboardData = {
  totalVehicles: 0,
  topOverallModel: { name: '-', quantity: 0 },
  topRegion: { name: '-', quantity: 0 },
  topState: { name: '-', quantity: 0 },
  topCity: { name: '-', quantity: 0 },
  regionalData: [],
  topModelsChart: [],
  fleetByYearChart: [],
  fleetAgeBrackets: [],
};

const initialFilters: Filters = {
    region: '', state: '', city: '',
    manufacturer: '', model: [], version: [], year: '',
};

type WelcomeState = {
    titleKey: string;
    highlights: (keyof Filters)[];
};

interface DashboardClientProps {
  initialFilterOptions: FilterOptions;
}

const DashboardClient: FC<DashboardClientProps> = ({ initialFilterOptions }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions);

  const [isLoading, setIsLoading] = useState(false);
  
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);

  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);
  const [isVersionLimitModalOpen, setIsVersionLimitModalOpen] = useState(false);
  
  const [generalAnalysis, setGeneralAnalysis] = useState<AnswerFleetQuestionOutput | null>(null);
  const [demandAnalysis, setDemandAnalysis] = useState<PredictPartsDemandOutput | null>(null);
  
  const [highlightedFilters, setHighlightedFilters] = useState<(keyof Filters)[]>([]);

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

  // This logic defines which filters to highlight to guide the user.
  const getWelcomeTitleAndHighlights = useCallback((): WelcomeState => {
    const { region, state, manufacturer, model, year, city } = filters;

    // Default state: No filters applied
    if (!isFiltered) {
        return { titleKey: 'welcome_title_start', highlights: ['region', 'manufacturer', 'year'] };
    }

    // Flow 1: Started by Location
    if (region && !manufacturer && !year) {
        if (!state) return { titleKey: 'welcome_title_location_needs_state', highlights: ['state', 'manufacturer', 'year'] };
        return { titleKey: 'welcome_title_location_needs_vehicle_details', highlights: ['city', 'manufacturer', 'year'] };
    }

    // Flow 2: Started by Vehicle
    if (manufacturer && !region && !year) {
        return { titleKey: 'welcome_title_vehicle_needs_model_region_year', highlights: ['model', 'region', 'year'] };
    }
    if (manufacturer && year && !region) {
         return { titleKey: 'welcome_title_vehicle_needs_model_region_year', highlights: ['region', 'model'] };
    }
    if (manufacturer && region && model.length === 0) {
        if (!state) return { titleKey: 'welcome_title_vehicle_region_needs_model_state_year', highlights: ['model', 'state'] };
    }

    // Flow 3: Started by Year
    if (year && !region && !manufacturer) {
        return { titleKey: 'welcome_title_year_needs_region_manufacturer', highlights: ['region', 'manufacturer'] };
    }
    if (year && region && !manufacturer) {
        if (!state) return { titleKey: 'welcome_title_year_needs_region_manufacturer', highlights: ['state', 'manufacturer'] };
        if (state) return { titleKey: 'welcome_title_year_needs_region_manufacturer', highlights: ['manufacturer', 'city'] };
    }
     if (year && manufacturer && !region) {
        return { titleKey: 'welcome_title_year_needs_region_manufacturer', highlights: ['region', 'model'] };
    }

    return { titleKey: 'welcome_subtitle', highlights: [] };
  }, [filters, isFiltered]);


  const isSearchEnabled = useMemo(() => {
    const { region, state, manufacturer, model, year } = debouncedFilters;
    // Rule 1: Location-based flow requires state and one more key detail
    if (region && state) return true;
    // Rule 2: Vehicle-based flow requires manufacturer and model
    if (manufacturer && model.length > 0) return true;
    // Rule 3: Year-based flow
    if (year && region) return true;
    
    return false;
  }, [debouncedFilters]);

  // Effect for fetching DASHBOARD DATA based on DEBOUNCED filters
  useEffect(() => {
    if (!isSearchEnabled) {
      setDashboardData(emptyDashboardData);
      setIsLoading(false);
      return;
    }
    
    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      startTransition(async () => {
        try {
          const data = await getFleetData(debouncedFilters);
          if (!isCancelled) {
            setDashboardData(data);
          }
        } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: t('error'), description: 'Failed to load dashboard data.' });
          if (!isCancelled) {
            setDashboardData(emptyDashboardData);
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      });
    };

    fetchData();
    
    return () => {
        isCancelled = true;
    }
  }, [debouncedFilters, isSearchEnabled, t, toast]);


  // Effect for fetching FILTER OPTIONS immediately when a filter changes
  useEffect(() => {
    let isCancelled = false;
    
    const fetchOptions = async () => {
        try {
            const options = await getInitialFilterOptions(filters);
            if (!isCancelled) {
                // Preserve selected values that still exist in the new options
                setFilterOptions(prevOptions => ({
                    regions: options.regions.length > 0 ? options.regions : prevOptions.regions,
                    states: options.states.length > 0 ? options.states : prevOptions.states,
                    cities: options.cities.length > 0 ? options.cities : prevOptions.cities,
                    manufacturers: options.manufacturers.length > 0 ? options.manufacturers : prevOptions.manufacturers,
                    models: options.models.length > 0 ? options.models : prevOptions.models,
                    versions: options.versions.length > 0 ? options.versions : prevOptions.versions,
                    years: options.years.length > 0 ? options.years : prevOptions.years,
                }));
            }
        } catch (error) {
             console.error('Failed to fetch dynamic filter options:', error);
             toast({ variant: 'destructive', title: t('error'), description: 'Failed to update filter options.' });
        }
    };
    
    fetchOptions();
    
    return () => {
        isCancelled = true;
    }

  }, [filters, toast]);


  const handleFilterChange = useCallback((key: keyof Filters, value: any) => {
    setFilters(prev => {
        const updated: Filters = { ...prev };
        const finalValue = value === 'all' ? '' : value;
        
        updated[key] = finalValue;

        // --- Cascading Logic ---
        if (key === 'region' && finalValue !== prev.region) {
            updated.state = '';
            updated.city = '';
        }
        if (key === 'state' && finalValue !== prev.state) {
            updated.city = '';
        }
        
        if (key === 'manufacturer' && finalValue !== prev.manufacturer) {
            updated.model = [];
            updated.version = [];
        }
        if (key === 'model' && finalValue !== prev.model) {
            updated.version = [];
        }
        
        if (key === 'year' && finalValue !== '' && typeof finalValue === 'string') {
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
    const doc = new jsPDF('l', 'mm', 'a4');
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Relatório de Análise de Frota - Frota.AI', 14, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' }), 14, y);
    y += 15;

    const addSection = (title: string, value: string | undefined | null) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(title, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(value || '-', 80, y);
      y += 8;
    };
    
    addSection(t('total_vehicles'), dashboardData.totalVehicles.toLocaleString());
    addSection(t('main_region'), dashboardData.topRegion?.name);
    addSection(t('main_state'), dashboardData.topState?.name);
    addSection(t('main_overall_model'), dashboardData.topOverallModel.name);
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
        if (y > 180) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(t('ai_analysis_title'), 14, y);
        y += 8;

        const addTextSection = (title: string, content: string | null | undefined) => {
            if (!content) return;
            if (y > 180) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(title, 14, y);
            y += 7;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            const formattedText = formatTextForPdf(content);
            const splitText = doc.splitTextToSize(formattedText, doc.internal.pageSize.getWidth() - 28);
            doc.text(splitText, 14, y);
            y += (splitText.length * 5) + 10;
        };

        addTextSection(t('executive_summary'), generalAnalysis.executiveSummary);
        addTextSection(t('age_analysis'), generalAnalysis.ageAnalysis);
        addTextSection(t('regional_analysis'), generalAnalysis.regionalAnalysis);
        addTextSection(t('strategic_recommendation'), generalAnalysis.strategicRecommendation);
    }

    if (demandAnalysis && demandAnalysis.predictions.length > 0) {
        if (y > 150) { doc.addPage(); y = 20; }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(t('part_demand_forecast_title'), 14, y);
        y += 10;

        demandAnalysis.predictions.forEach(pred => {
            if (y > 180) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`${pred.partName} (Demanda: ${pred.demandLevel})`, 14, y);
            y += 6;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            
            const reasonText = doc.splitTextToSize(`Razão: ${formatTextForPdf(pred.reason)}`, doc.internal.pageSize.getWidth() - 28);
            doc.text(reasonText, 14, y);
            y += (reasonText.length * 4) + 2;
            
            const opportunityText = doc.splitTextToSize(`Oportunidade: ${formatTextForPdf(pred.opportunity)}`, doc.internal.pageSize.getWidth() - 28);
            doc.text(opportunityText, 14, y);
            y += (opportunityText.length * 4) + 8;
        });
    }
    
    doc.addPage();
    let chartY = 20;
    let chartCountOnPage = 0;

    const addBase64ImageToPdf = async (doc: jsPDF, elementId: string, title: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        if (chartCountOnPage >= 2) {
          doc.addPage();
          chartY = 20;
          chartCountOnPage = 0;
        }
        
        const canvas = await html2canvas(element, { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#FFFFFF'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 130; 
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const xPos = (chartCountOnPage % 2) * 148 + 14; 
        
        if (chartCountOnPage > 0 && chartCountOnPage % 2 === 0) {
            doc.addPage();
            chartY = 20;
            chartCountOnPage = 0;
        }

        doc.setFontSize(14);
        doc.text(title, xPos, chartY);
        doc.addImage(imgData, 'PNG', xPos, chartY + 5, imgWidth, imgHeight);

        if (chartCountOnPage % 2 !== 0) {
            chartY += imgHeight + 20; 
        }

        chartCountOnPage++;
      }
    };

    const charts = [
        { id: 'regional-analysis-chart', title: t('regional_fleet_analysis') },
        { id: 'fleet-age-chart', title: t('fleet_by_age_bracket') },
        { id: 'top-models-chart', title: t('top_models_by_volume', { count: 10 }) },
        { id: 'fleet-by-year-chart', title: t('fleet_by_year') }
    ];

    let currentY = 20;
    let pageChartCount = 0;

    for (const chart of charts) {
        const element = document.getElementById(chart.id);
        if (element) {
            if (pageChartCount >= 2) {
                doc.addPage();
                currentY = 20;
                pageChartCount = 0;
            }

            const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            const contentWidth = (doc.internal.pageSize.getWidth() / 2) - 20;
            const contentHeight = (canvas.height * contentWidth) / canvas.width;
            
            const x = 14 + (pageChartCount % 2) * (doc.internal.pageSize.getWidth() / 2);

            doc.setFontSize(12);
            doc.text(chart.title, x, currentY);
            doc.addImage(imgData, 'PNG', x, currentY + 5, contentWidth, contentHeight);

            if (pageChartCount % 2 !== 0) {
                 currentY += contentHeight + 15;
            }
            
            pageChartCount++;
        }
    }
    
    // Add legal text on a new page if needed, or at the bottom of the last one.
    if (currentY > 150) { 
        doc.addPage();
        currentY = 20;
    } else {
        currentY = 170;
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    const legalText = `O Frota.AI utiliza um banco de dados confiável e algoritmos de análise avançada.\nOs resultados apresentados são sugestões baseadas nos filtros aplicados e gráficos gerados.\nO sistema não substitui a avaliação humana nem deve ser considerado como única fonte para decisões.\nNosso propósito é fornecer clareza de dados, evidenciar oportunidades e ajudar a prevenir desperdícios ou custos desnecessários.`;
    const splitText = doc.splitTextToSize(legalText, doc.internal.pageSize.getWidth() - 28);
    doc.text(splitText, 14, currentY);

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

  const welcomeState = useMemo(() => getWelcomeTitleAndHighlights(), [getWelcomeTitleAndHighlights]);

  useEffect(() => {
    if (!isSearchEnabled) {
        setHighlightedFilters(welcomeState.highlights);
    } else {
        setHighlightedFilters([]);
    }
  }, [welcomeState.highlights, isSearchEnabled]);


  const renderContent = () => {
    if (isLoading || isPending) {
        return (
            <div className="flex flex-1 h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isSearchEnabled) {
      return <div className="flex-1"><WelcomePlaceholder titleKey={welcomeState.titleKey} /></div>;
    }


    return (
      <div className="flex flex-col gap-4 md:gap-8">
        <StatCards data={dashboardData} isLoading={isPending} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div id="regional-analysis-chart">
                <RegionalFleetAnalysis 
                    data={dashboardData.regionalData} 
                    selectedRegion={filters.region}
                    selectedState={filters.state}
                />
            </div>
             <div id="top-models-chart">
                <TopModelsChart data={dashboardData.topModelsChart} />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
            <div id="fleet-age-chart">
                <FleetAgeBracketChart data={fleetAgeBracketsWithLabels} totalVehicles={dashboardData.totalVehicles} />
            </div>
            <div id="fleet-by-year-chart">
                <FleetByYearChart data={dashboardData.fleetByYearChart} />
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

        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('attention_title')}</AlertTitle>
            <AlertDescription>
                {t('comparison_warning')}
            </AlertDescription>
        </Alert>
      </div>
    );
  }


  return (
    <SidebarProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
        <DashboardSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            filterOptions={filterOptions}
            disabledFilters={disabledFilters}
            highlightedFilters={highlightedFilters}
        />
        <div className="flex flex-col">
            <DashboardHeader 
            onExport={handleExportPDF} 
            isFiltered={isFiltered && dashboardData.totalVehicles > 0}
            />
            <main className="flex flex-col flex-1 overflow-auto p-4 md:p-8 bg-muted/20">
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
                    <div className="mt-4">
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
                
                <div className="flex flex-col gap-4 md:gap-8 mt-4 flex-1">
                {renderContent()}
                </div>
            </main>
        </div>
        </div>
    </SidebarProvider>
  );
};

export default DashboardClient;

    