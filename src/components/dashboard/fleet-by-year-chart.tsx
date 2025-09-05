'use client';

import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Vehicle } from '@/types';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Loader2, Wand2 } from 'lucide-react';
import { summarizeChartData, type ChartData } from '@/ai/flows/summarize-chart-data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '../ui/alert';
import { Sparkles } from 'lucide-react';

interface FleetByYearChartProps {
  data: Vehicle[];
}

const FleetByYearChart: FC<FleetByYearChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState('');

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const yearlyFleet = data.reduce((acc, item) => {
      acc[item.year] = (acc[item.year] || 0) + item.quantity;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(yearlyFleet)
      .map(([year, quantity]) => ({ year: parseInt(year), quantity }))
      .sort((a, b) => a.year - b.year);
  }, [data]);

  const handleGenerateAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysis('');
    try {
      const result = await summarizeChartData({
        chartData: chartData as ChartData[],
        chartTitle: t('fleet_by_year'),
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
  }

  return (
    <Card className="flex flex-col xl:col-span-2">
      <CardHeader>
        <CardTitle>{t('fleet_by_year')}</CardTitle>
        <CardDescription>{t('fleet_by_year_description')}</CardDescription>
      </CardHeader>
      <CardContent className='flex-grow'>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => String(value)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Line
                dataKey="quantity"
                type="natural"
                stroke="var(--color-quantity)"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          ) : (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
              {t('no_data_for_filters')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t p-4 bg-muted/20">
        <div className="flex items-center justify-between w-full">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {t('ai_analysis')}
          </h3>
          <Button onClick={handleGenerateAnalysis} disabled={loadingAnalysis || chartData.length === 0} size="sm" variant="outline">
            {loadingAnalysis ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {loadingAnalysis ? t('generating_analysis') : t('generate_analysis')}
          </Button>
        </div>
        {analysis ? (
           <Alert variant="default" className="bg-background border-primary/50 text-sm">
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

export default FleetByYearChart;
