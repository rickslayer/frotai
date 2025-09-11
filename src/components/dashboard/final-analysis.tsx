
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { answerFleetQuestion } from '@/ai/flows/answer-fleet-question';
import type { Filters, Vehicle, RegionData, FleetAgeBracket, ChartData } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Download, Loader2, Sparkles, Terminal } from 'lucide-react';

interface FinalAnalysisProps {
  filters: Filters;
  disabled: boolean;
  fleetAgeBrackets: FleetAgeBracket[];
  regionalData: RegionData[];
  fleetByYearData: ChartData[];
  onAnalysisGenerated: (analysis: string | null) => void;
}

const FinalAnalysis: FC<FinalAnalysisProps> = ({ filters, disabled, fleetAgeBrackets, regionalData, fleetByYearData, onAnalysisGenerated }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

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

      setAnalysis(result.answer);
      onAnalysisGenerated(result.answer);
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

  const handleDownloadText = () => {
    if (!analysis) return;

    const blob = new Blob([analysis.replace(/<br \/>/g, '\n').replace(/<\/?[^>]+(>|$)/g, "")], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
a.href = url;
    a.download = 'frota-ai-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
             <Alert>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  <AlertTitle>{t('ai_analysis_title')}</AlertTitle>
                </div>
                 <Button variant="ghost" size="icon" onClick={handleDownloadText} className="h-6 w-6">
                    <Download className="h-4 w-4" />
                  </Button>
              </div>
              <AlertDescription>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinalAnalysis;
