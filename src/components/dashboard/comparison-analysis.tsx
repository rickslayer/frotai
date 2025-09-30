
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import type { AnalysisSnapshot, Filters, CompareFleetDataOutput } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Download, Loader2, Sparkles, X, AlertCircle, Users, History, Map, Rocket } from 'lucide-react';
import { compareFleetData } from '@/ai/flows/compare-fleet-data';
import jsPDF from 'jspdf';
import {marked} from 'marked';


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
                if (value.length === 0) return null; // Não mostra a versão se estiver vazia
                // Se todas as versões estiverem selecionadas (comparando com a contagem total), mostra "Todas"
                if (snapshot.availableVersionsCount && value.length === snapshot.availableVersionsCount) {
                    return { key: t(key), value: t('all_versions') };
                }
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

const comparisonSections = (t: any) => [
    { key: 'overview', title: 'comparison_overview', icon: Users, color: 'text-primary' },
    { key: 'ageComparison', title: 'age_comparison', icon: History, color: 'text-blue-500' },
    { key: 'regionalComparison', title: 'regional_comparison', icon: Map, color: 'text-green-500' },
    { key: 'recommendation', title: 'strategic_recommendation', icon: Rocket, color: 'text-purple-500' }
] as const;


const ComparisonAnalysis: FC<ComparisonAnalysisProps> = ({ snapshots, onClear, onClearAll }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CompareFleetDataOutput | null>(null);

  const canCompare = snapshots[0] && snapshots[1];

  const prepareDataForAI = (snapshot: AnalysisSnapshot) => {
    if (!snapshot) return null;

    const filters = Object.entries(snapshot.filters)
        .filter(([, value]) => value && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true))
        .map(([key, value]) => `${t(key as any)}: ${Array.isArray(value) ? value.join(', ') : value}`)
        .join('; ');
    
    const topAgeBracket = [...snapshot.fleetAgeBrackets].sort((a,b) => b.quantity - a.quantity)[0];
    const topRegion = [...snapshot.regionalData].sort((a,b) => b.quantity - a.quantity)[0];

    return {
        filters: filters || t('no_specific_filters'),
        totalVehicles: snapshot.totalVehicles,
        topAgeBracket: `${topAgeBracket?.label}: ${topAgeBracket?.quantity.toLocaleString()} ${t('vehicles')}`,
        topRegion: `${topRegion?.name}: ${topRegion?.quantity.toLocaleString()} ${t('vehicles')}`,
    };
  }


  const handleGenerateComparison = async () => {
    if (!canCompare) return;

    setLoading(true);
    setAnalysis(null);
    try {
      const scenarioA_data = prepareDataForAI(snapshots[0]!);
      const scenarioB_data = prepareDataForAI(snapshots[1]!);

      if (!scenarioA_data || !scenarioB_data) {
        throw new Error("Failed to prepare snapshot data for AI.");
      }

      const result = await compareFleetData({
        scenarioA: scenarioA_data,
        scenarioB: scenarioB_data,
      });

      if (!result) {
          throw new Error('AI response was empty.');
      }
      setAnalysis(result);
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

   const handleDownloadPdf = async () => {
    if (!analysis) return;

    const doc = new jsPDF();
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(t('ai_comparison_title'), 14, 22);

    let y = 35;
    for (const section of comparisonSections(t)) {
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
    
    doc.save('frota-ai-comparative-analysis.pdf');
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
            <div className='flex justify-end'>
                <Button variant="ghost" size="icon" onClick={handleDownloadPdf} className="h-8 w-8">
                  <Download className="h-4 w-4" />
                </Button>
            </div>
             
             {comparisonSections(t).map(({key, title, icon: Icon, color}) => {
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

            <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('attention_title')}</AlertTitle>
                <AlertDescription>
                    {t('comparison_warning')}
                </AlertDescription>
            </Alert>
          </div>
        )}

      </CardContent>
    </Card>
  );
};

export default ComparisonAnalysis;
