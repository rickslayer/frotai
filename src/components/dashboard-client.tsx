
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
    version: '',
    year: '',
  });
  
  const [isComparing, setIsComparing] = useState(false);
  const [snapshots, setSnapshots] = useState<[AnalysisSnapshot | null, AnalysisSnapshot | null]>([null, null]);

  const dashboardContentRef = useRef<HTMLDivElement>(null);

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

  const handleExportPDF = () => {
    const input = dashboardContentRef.current;
    if (!input) return;

    // We can add a class to temporarily style the dashboard for export
    document.body.classList.add('exporting-pdf');

    html2canvas(input, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        onclone: (document) => {
            // Remove the export button from the clone to avoid it appearing in the PDF
            const exportButton = document.getElementById('export-button');
            if (exportButton) {
                exportButton.style.display = 'none';
            }
             const compareButton = document.getElementById('compare-button');
            if (compareButton) {
                compareButton.style.display = 'none';
            }
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
        const width = pdfWidth;
        const height = width / ratio;

        // Check if the content fits on one page
        if (height <= pdfHeight) {
            pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        } else { // Handle multi-page content
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();
            let remainingHeight = canvas.height;

            while (remainingHeight > 0) {
                const pageCanvas = document.createElement('canvas');
                const pageCtx = pageCanvas.getContext('2d');
                if (!pageCtx) return;

                // A4 aspect ratio
                const a4Ratio = 1.414;
                const sourceHeight = canvas.width / (pdfWidth / pageHeight);

                pageCanvas.width = canvas.width;
                pageCanvas.height = Math.min(sourceHeight, remainingHeight);
                
                pageCtx.drawImage(canvas, 0, position, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
                
                const pageImgData = pageCanvas.toDataURL('image/png');
                if (position > 0) {
                    pdf.addPage();
                }
                pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfWidth / (pageCanvas.width / pageCanvas.height));
                
                position += pageCanvas.height;
                remainingHeight -= pageCanvas.height;
            }
        }

        pdf.save(`frota-ai-report-${new Date().toISOString().slice(0,10)}.pdf`);
    }).catch(() => {
         document.body.classList.remove('exporting-pdf');
    });
  };
  
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
    const totalVehicles = filteredData.reduce((sum, item) => sum + item.quantity, 0);

    const snapshot: AnalysisSnapshot = {
      filters: { ...filters },
      totalVehicles,
      fleetAgeBrackets,
      regionalData,
      fleetByYearData
    };
    
    setSnapshots(prev => {
      if (!prev[0]) {
        return [snapshot, prev[1]];
      }
      if (!prev[1]) {
        return [prev[0], snapshot];
      }
      // If both are full, replace the second one
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

          {!isFiltered ? (
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
