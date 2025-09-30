
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { answerFleetQuestion } from '@/ai/flows/answer-fleet-question';
import type { Filters, ChartData, FleetAgeBracket, RegionData, AnswerFleetQuestionOutput, Persona } from '@/types';
import { Download, Loader2, Sparkles, FileText, History, Map, Calendar, Rocket } from 'lucide-react';
import jsPDF from 'jspdf';
import {marked} from 'marked';
import PersonaSelectorDialog from './persona-selector-dialog';
import { Separator } from '../ui/separator';

interface FinalAnalysisProps {
  filters: Filters;
  disabled: boolean;
  fleetAgeBrackets: FleetAgeBracket[];
  regionalData: RegionData[];
  fleetByYearData: ChartData[];
  totalVehicles: number;
  onAnalysisGenerated: (analysis: AnswerFleetQuestionOutput | null) => void;
}

const analysisSections = (t: any) => [
    { key: 'executiveSummary', title: 'executive_summary', icon: FileText, color: 'text-primary' },
    { key: 'ageAnalysis', title: 'age_analysis', icon: History, color: 'text-blue-500' },
    { key: 'regionalAnalysis', title: 'regional_analysis', icon: Map, color: 'text-green-500' },
    { key: 'yearAnalysis', title: 'year_analysis', icon: Calendar, color: 'text-orange-500' },
    { key: 'strategicRecommendation', title: 'strategic_recommendation', icon: Rocket, color: 'text-purple-500' }
] as const;

const FinalAnalysis: FC<FinalAnalysisProps> = ({ filters, disabled, fleetAgeBrackets, regionalData, fleetByYearData, totalVehicles, onAnalysisGenerated }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnswerFleetQuestionOutput | null>(null);
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (disabled) return;
    setAnalysis(null);
    onAnalysisGenerated(null);
    setIsPersonaDialogOpen(true);
  }

  const handleGenerateAnalysis = async (persona: Persona) => {
    setIsPersonaDialogOpen(false);
    setLoading(true);
    try {
      const activeFilters = Object.entries(filters)
        .filter(([, value]) => value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => `${t(key as any)}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
      
      const filtersText = activeFilters || t('no_specific_filters');

      const sortedAges = [...fleetAgeBrackets].sort((a,b) => b.quantity - a.quantity);
      const predominantAgeBracket = sortedAges.length > 0 ? `${sortedAges[0].label}: ${sortedAges[0].quantity.toLocaleString()}` : t('no_data_available');

      const sortedRegions = [...regionalData].sort((a,b) => b.quantity - a.quantity);
      const predominantRegion = sortedRegions.length > 0 ? `${sortedRegions[0].name}: ${sortedRegions[0].quantity.toLocaleString()}` : t('no_data_available');

      const sortedYears = [...fleetByYearData].sort((a,b) => b.quantity - a.quantity).slice(0, 2);
      const yearPeaks = sortedYears.length > 0 ? sortedYears.map(y => `${y.name}: ${y.quantity.toLocaleString()}`).join('; ') : t('no_data_available');


      const result = await answerFleetQuestion({
        persona,
        filters: filtersText,
        summary: {
          totalVehicles: totalVehicles.toLocaleString(),
          predominantAgeBracket,
          predominantRegion,
          yearPeaks
        }
      });

      setAnalysis(result);
      onAnalysisGenerated(result);
    } catch (error) {
      console.error('Error generating final analysis:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('analysis_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!analysis) return;
    
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(t('ai_analysis_title'), 14, 22);
    
    let y = 35;

    for (const section of analysisSections(t)) {
        //@ts-ignore
        const content = analysis[section.key];
        if (content) {
            if (y > 260) {
                doc.addPage();
                y = 20;
            }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text(t(section.title), 14, y);
            y += 7;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            
            const html = await marked.parse(content);
            const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
            const splitText = doc.splitTextToSize(plainText, 180);
            
            doc.text(splitText, 14, y);
            y += splitText.length * 5 + 10;
        }
    }
    
    doc.save('frota-ai-analysis.pdf');
};


  return (
    <>
      <PersonaSelectorDialog
        open={isPersonaDialogOpen}
        onOpenChange={setIsPersonaDialogOpen}
        onPersonaSelect={handleGenerateAnalysis}
        onGoBack={() => setIsPersonaDialogOpen(false)}
      />
      <Card className="flex flex-col h-full">
        <CardHeader>
          <CardTitle>{t('ai_analysis_title')}</CardTitle>
          <CardDescription>{t('analysis_placeholder')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-grow p-8">
              <Sparkles className="h-12 w-12 mb-4 text-primary/30" />
              <p>{t('analysis_initial_prompt')}</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground flex-grow p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-lg font-medium">{t('generating_analysis')}</p>
              <p className="text-sm">{t('generating_analysis_subtitle')}</p>
            </div>
          )}

          {analysis && (
              <div className="space-y-6 pt-4">
                  <div className='flex justify-end -mt-4 -mr-2'>
                      <Button variant="ghost" size="icon" onClick={handleDownloadPdf} title={t('export')}>
                        <Download className="h-4 w-4" />
                      </Button>
                  </div>

                  {analysisSections(t).map(({key, title, icon: Icon, color}, index) => {
                      //@ts-ignore
                      const content = analysis[key];
                      if (!content) return null;
                      return (
                          <div key={key}>
                            <div className="flex items-start gap-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted flex-shrink-0">
                                  <Icon className={`h-5 w-5 ${color}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-foreground mb-1">{t(title)}</h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                                </div>
                            </div>
                            {index < analysisSections(t).length - 1 && <Separator className="mt-6" />}
                          </div>
                      )
                  })}
              </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6">
           <Button onClick={handleOpenDialog} disabled={disabled || loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {loading ? t('generating_analysis') : (analysis ? t('regenerate_analysis') : t('generate_analysis'))}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};

export default FinalAnalysis;
