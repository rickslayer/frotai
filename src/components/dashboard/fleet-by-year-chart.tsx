'use client';

import type { FC } from 'react';
import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface FleetAnalysisProps {
  data: Vehicle[];
  onAskAi: (question: string) => void;
  aiAnswer: string;
  isAskingAi: boolean;
  question: string;
  setQuestion: (question: string) => void;
}

const FleetAnalysis: FC<FleetAnalysisProps> = ({
  data,
  onAskAi,
  aiAnswer,
  isAskingAi,
  question,
  setQuestion,
}) => {
  const { t } = useTranslation();

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

  const handleAskClick = () => {
    if (question.trim()) {
      onAskAi(question);
    }
  };

  return (
    <Card className="flex flex-col">
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
      <div className="border-t p-4 space-y-4">
        <h3 className="text-base font-semibold">{t('ai_analysis')}</h3>
        <p className="text-sm text-muted-foreground">{t('ai_analysis_description')}</p>
        <div className="space-y-2">
           <Textarea
              placeholder={t('ask_ai_placeholder')}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isAskingAi}
            />
            <Button onClick={handleAskClick} disabled={isAskingAi || !question.trim()} size="sm">
              {isAskingAi ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isAskingAi ? t('generating_analysis') : t('ask_ai')}
            </Button>
        </div>
         {aiAnswer && (
           <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>{t('ai_answer')}</AlertTitle>
              <AlertDescription>
                {aiAnswer}
              </AlertDescription>
            </Alert>
         )}
      </div>
    </Card>
  );
};

export default FleetAnalysis;
