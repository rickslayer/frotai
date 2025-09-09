
'use client';

import * as React from 'react';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import type { RegionData } from '@/lib/regions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Button } from '../ui/button';
import { Terminal, Loader2, Wand2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { summarizeChartData } from '@/ai/flows/summarize-chart-data';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface RegionalFleetChartProps {
  data: RegionData[];
}

const RegionalFleetChart: React.FC<RegionalFleetChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loadingAnalysis, setLoadingAnalysis] = React.useState(false);
  const [analysis, setAnalysis] = React.useState('');
  
  const totalVehicles = React.useMemo(() => data.reduce((acc, curr) => acc + curr.quantity, 0), [data]);

  const chartConfig = React.useMemo(() => {
    const config: any = {};
    data.forEach(item => {
        config[item.name] = {
            label: t(item.name as any),
            color: item.fill,
        };
    });
    return config;
  }, [data, t]);
  
  const chartDataForAI = React.useMemo(() => data.map(item => ({
      name: t(item.name as any),
      quantity: item.quantity
  })), [data, t]);

  const handleGenerateAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysis('');
    try {
      const result = await summarizeChartData({
        chartData: chartDataForAI.filter(d => d.quantity > 0),
        chartTitle: t('regional_fleet_analysis_title_ai', { total: totalVehicles.toLocaleString() }),
      });
      setAnalysis(result.summary);
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('analysis_error'),
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>{t('regional_fleet_analysis')}</CardTitle>
        <CardDescription>{t('regional_fleet_analysis_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center p-2 sm:p-4">
        {totalVehicles > 0 ? (
          <div className="w-full h-[250px] flex flex-col md:flex-row items-center gap-4">
             <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square h-full w-full md:w-1/2"
              >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel nameKey="name" />}
                    />
                  <Pie
                    data={data}
                    dataKey="quantity"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={2}
                    labelLine={false}
                  >
                    {data.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.quantity > 0 ? entry.fill : 'hsl(var(--muted))'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="w-full md:w-1/2 flex flex-col gap-2 text-sm">
               <div className="font-semibold mb-2">{t('total_by_region')}</div>
              {data.map((entry) => (
                <div key={entry.name} className={cn("flex items-center justify-between transition-opacity", entry.quantity === 0 && "opacity-50")}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.quantity > 0 ? entry.fill : 'hsl(var(--muted))' }}
                    />
                    <span>{t(entry.name as any)}</span>
                  </div>
                   <div className='flex items-center gap-3'>
                    <span className="font-mono text-xs text-muted-foreground">
                        {entry.quantity.toLocaleString()}
                    </span>
                    <Badge variant="secondary" className='w-16 justify-center font-mono'>
                        {totalVehicles > 0 ? ((entry.quantity / totalVehicles) * 100).toFixed(1) : '0.0'}%
                    </Badge>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-center">
            {t('no_data_for_regional_chart')}
          </div>
        )}
      </CardContent>
       <CardFooter className="flex-col items-start gap-2 border-t p-4">
          <div className="flex w-full items-center justify-between">
            <h3 className="text-base font-semibold">{t('ai_analysis_title')}</h3>
            <Button onClick={handleGenerateAnalysis} disabled={loadingAnalysis || totalVehicles === 0} size="sm">
              {loadingAnalysis ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {loadingAnalysis ? t('generating_analysis') : t('generate_analysis')}
            </Button>
          </div>
          {analysis ? (
             <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t('ai_analysis_title')}</AlertTitle>
              <AlertDescription>
                {analysis}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-muted-foreground">{t('analysis_placeholder')}</p>
          )}
        </CardFooter>
    </Card>
  );
};

export default RegionalFleetChart;
