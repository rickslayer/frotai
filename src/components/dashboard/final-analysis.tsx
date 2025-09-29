
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { answerFleetQuestion } from '@/ai/flows/answer-fleet-question';
import type { Filters, ChartData, FleetAgeBracket, RegionData, AnswerFleetQuestionOutput } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Download, Loader2, Sparkles, FileText, History, Map, Calendar, Rocket, Lightbulb } from 'lucide-react';
import jsPDF from 'jspdf';
import {marked} from 'marked';


interface FinalAnalysisProps {
  filters: Filters;
  disabled: boolean;
  fleetAgeBrackets: FleetAgeBracket[];
  regionalData: RegionData[];
  fleetByYearData: ChartData[];
  onAnalysisGenerated: (analysis: AnswerFleetQuestionOutput | null) => void;
}

const analysisSections = (t: any) => [
    { key: 'executiveSummary', title: 'executive_summary', icon: FileText, color: 'text-primary' },
    { key: 'ageAnalysis', title: 'age_analysis', icon: History, color: 'text-blue-500' },
    { key: 'regionalAnalysis', title: 'regional_analysis', icon: Map, color: 'text-green-500' },
    { key: 'yearAnalysis', title: 'year_analysis', icon: Calendar, color: 'text-orange-500' },
    { key: 'strategicRecommendation', title: 'strategic_recommendation', icon: Rocket, color: 'text-purple-500' }
] as const;

const FinalAnalysis: FC<FinalAnalysisProps> = ({ filters, disabled, fleetAgeBrackets, regionalData, fleetByYearData, onAnalysisGenerated }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnswerFleetQuestionOutput | null>(null);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    onAnalysisGenerated(null);
    try {
      const activeFilters = Object.entries(filters)
        .filter(([, value]) => value && value !== 'all')
        .map(([key, value]) => `${t(key as any)}: ${value}`)
        .join(', ');

      const question = t('final_analysis_question', {
        filters: activeFilters || t('no_specific_filters'),
      });

      const result = await answerFleetQuestion({
        question,
        data: {
          fleetAgeBrackets,
          regionalData,
          fleetByYearData,
        },
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
            
            // Convert markdown to HTML then to plain text to strip markdown for PDF
            const html = await marked.parse(content.replace(/\*/g, '')); // Remove asterisks for bold etc.
            const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
            const splitText = doc.splitTextToSize(plainText, 180);
            
            doc.text(splitText, 14, y);
            y += splitText.length * 5 + 10;
        }
    }
    
    doc.save('frota-ai-analysis.pdf');
};


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('ai_analysis_title')}</CardTitle>
        <CardDescription>{t('analysis_placeholder')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <Button onClick={handleGenerateAnalysis} disabled={disabled || loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? t('generating_analysis') : t('generate_analysis')}
        </Button>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('generating_analysis')}</span>
          </div>
        )}

        {analysis && (
            <div className="space-y-4 pt-4">
                <div className='flex justify-end'>
                    <Button variant="ghost" size="icon" onClick={handleDownloadPdf} className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                </div>

                {analysisSections(t).map(({key, title, icon: Icon, color}) => {
                    const content = analysis[key];
                    if (!content) return null;
                    return (
                        <Alert key={key}>
                            <div className="flex items-start gap-4">
                                <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${color}`} />
                                <div className="flex-1">
                                    <AlertTitle className="font-bold mb-1">{t(title)}</AlertTitle>
                                    <AlertDescription>
                                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
                                    </AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    )
                })}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinalAnalysis;
