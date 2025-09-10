
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisSnapshot, Filters } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Download, Loader2, Sparkles, Terminal, X } from 'lucide-react';
import { compareFleetData } from '@/ai/flows/compare-fleet-data';

interface ComparisonAnalysisProps {
  snapshots: [AnalysisSnapshot | null, AnalysisSnapshot | null];
  onClear: (index: 0 | 1) => void;
  onClearAll: () => void;
}

const SnapshotCard: FC<{ snapshot: AnalysisSnapshot | null; onClear: () => void; title: string }> = ({ snapshot, onClear, title }) => {
    const { t } = useTranslation();
    if (!snapshot) return null;

    const filterDisplayOrder: (keyof AnalysisSnapshot['filters'])[] = ['state', 'city', 'manufacturer', 'model', 'version', 'year'];

    const filters = filterDisplayOrder
      .map(key => {
        const value = snapshot.filters[key];
        if (value && value !== 'all') {
            if (Array.isArray(value)) {
                if (value.length > 0) {
                     return { key: t(key), value: value.join(', ') };
                }
            } else if (String(value) !== '') {
                 return { key: t(key), value: String(value) };
            }
        }
        return null;
      })
      .filter(Boolean);

    return (
        <Card className="relative bg-muted/30">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={onClear}>
                <X className="h-4 w-4" />
            </Button>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                {filters.map(f => f && <p key={f.key}><span className="font-semibold">{f.key}:</span> {f.value}</p>)}
                 <p><span className="font-semibold">{t('total_vehicles')}:</span> {snapshot.totalVehicles.toLocaleString()}</p>
            </CardContent>
        </Card>
    )
}


const ComparisonAnalysis: FC<ComparisonAnalysisProps> = ({ snapshots, onClear, onClearAll }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const canCompare = snapshots[0] && snapshots[1];

  // Helper to convert all filter values to string for AI
  const prepareFiltersForAI = (filters: Filters) => {
    const prepared = {} as Record<string, string | string[]>;
    for (const key in filters) {
      const value = filters[key as keyof Filters];
      if (Array.isArray(value)) {
        prepared[key] = value;
      } else {
        prepared[key] = String(value);
      }
    }
    return prepared;
  };

  const handleGenerateComparison = async () => {
    if (!canCompare) return;

    setLoading(true);
    setAnalysis(null);
    try {
      const result = await compareFleetData({
        scenarioA: {
          filters: prepareFiltersForAI(snapshots[0]!.filters) as any,
          fleetAgeBrackets: snapshots[0]!.fleetAgeBrackets,
          regionalData: snapshots[0]!.regionalData,
          fleetByYearData: snapshots[0]!.fleetByYearData,
        },
        scenarioB: {
          filters: prepareFiltersForAI(snapshots[1]!.filters) as any,
          fleetAgeBrackets: snapshots[1]!.fleetAgeBrackets,
          regionalData: snapshots[1]!.regionalData,
          fleetByYearData: snapshots[1]!.fleetByYearData,
        }
      });
      setAnalysis(result.comparison);
    } catch (error) {
      console.error('Error generating comparison analysis:', error);
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

    const blob = new Blob([analysis.replace(/<br \/>/g, '\n').replace(/<\/?b>/g, '**')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'frota-ai-comparative-analysis.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>{t('comparison_title')}</CardTitle>
                <CardDescription>{t('comparison_description')}</CardDescription>
            </div>
            <Button variant="outline" onClick={onClearAll} size="sm">
                <X className="mr-2 h-4 w-4"/>
                {t('clear_comparison')}
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SnapshotCard snapshot={snapshots[0]} onClear={() => onClear(0)} title={t('scenario_a')} />
            <SnapshotCard snapshot={snapshots[1]} onClear={() => onClear(1)} title={t('scenario_b')} />
        </div>

        <Button onClick={handleGenerateComparison} disabled={!canCompare || loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? t('generating_comparison') : t('generate_comparison')}
        </Button>

         {analysis && (
          <div className="space-y-4 pt-4">
             <Alert>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Terminal className="h-4 w-4 mr-2" />
                  <AlertTitle>{t('ai_comparison_title')}</AlertTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDownloadText} className="h-6 w-6">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <AlertDescription>
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
              </AlertDescription>
            </Alert>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ComparisonAnalysis;
