'use client';

import type { FC, SVGProps } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, LabelProps } from 'recharts';
import { Car, History, Sparkles, Wrench } from 'lucide-react';
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

interface FleetAgeBracketChartProps {
  data: Vehicle[];
}

interface CustomLabelProps extends LabelProps {
  data: Array<{
    bracket: string;
    quantity: number;
    fill: string;
    icon: React.ComponentType<SVGProps<SVGSVGElement>>;
  }>;
}

const CustomLabel: FC<CustomLabelProps> = (props) => {
  const { x, y, width, height, index, data } = props;
  const item = data[index];
  const Icon = item.icon;
  
  if (typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number') {
    return null;
  }

  const paddingX = 12;
  const iconSize = 16;
  
  // Renderiza o conteúdo apenas se houver espaço suficiente na barra
  if (width < 80) {
    return null;
  }
  
  const labelX = x + paddingX;
  const labelY = y + height / 2;

  return (
    <g>
      <foreignObject x={labelX} y={labelY - iconSize/2} width={width - paddingX} height={iconSize}>
        <div className="flex items-center gap-2 overflow-hidden text-primary-foreground">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate text-sm font-medium">{item.bracket}</span>
        </div>
      </foreignObject>
    </g>
  );
};


const FleetAgeBracketChart: FC<FleetAgeBracketChartProps> = ({ data }) => {
  const { t } = useTranslation();

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--chart-2))',
    },
    new: { label: t('age_bracket_new'), color: 'hsl(var(--chart-1))', icon: Sparkles },
    semiNew: { label: t('age_bracket_semi_new'), color: 'hsl(var(--chart-2))', icon: Car },
    used: { label: t('age_bracket_used'), color: 'hsl(var(--chart-3))', icon: Wrench },
    old: { label: t('age_bracket_old'), color: 'hsl(var(--chart-4))', icon: History },
  } satisfies ChartConfig & { [key: string]: { icon: React.ComponentType<SVGProps<SVGSVGElement>> }};

  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const ageBrackets = {
      new: { total: 0, label: chartConfig.new.label, icon: chartConfig.new.icon },
      semiNew: { total: 0, label: chartConfig.semiNew.label, icon: chartConfig.semiNew.icon },
      used: { total: 0, label: chartConfig.used.label, icon: chartConfig.used.icon },
      old: { total: 0, label: chartConfig.old.label, icon: chartConfig.old.icon },
    };

    data.forEach(item => {
      const age = currentYear - item.year;
      if (age >= 0 && age <= 3) {
        ageBrackets.new.total += item.quantity;
      } else if (age >= 4 && age <= 7) {
        ageBrackets.semiNew.total += item.quantity;
      } else if (age >= 8 && age <= 12) {
        ageBrackets.used.total += item.quantity;
      } else if (age >= 13) {
        ageBrackets.old.total += item.quantity;
      }
    });

    return [
      { bracket: ageBrackets.new.label, quantity: ageBrackets.new.total, fill: 'var(--color-new)', icon: ageBrackets.new.icon },
      { bracket: ageBrackets.semiNew.label, quantity: ageBrackets.semiNew.total, fill: 'var(--color-semiNew)', icon: ageBrackets.semiNew.icon },
      { bracket: ageBrackets.used.label, quantity: ageBrackets.used.total, fill: 'var(--color-used)', icon: ageBrackets.used.icon },
      { bracket: ageBrackets.old.label, quantity: ageBrackets.old.total, fill: 'var(--color-old)', icon: ageBrackets.old.icon },
    ].filter(d => d.quantity > 0);

  }, [data, t, chartConfig]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('fleet_by_age_bracket')}</CardTitle>
        <CardDescription>{t('fleet_by_age_bracket_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          {chartData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
                }}
                layout="vertical"
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="bracket"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={false}
                  width={1}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="quantity" radius={5} barSize={35}>
                   <LabelList 
                      content={<CustomLabel data={chartData} />}
                      dataKey="bracket" 
                    />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {t('no_data_available')}
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default FleetAgeBracketChart;
