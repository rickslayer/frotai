
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
import type { FleetAgeBracket } from '@/types';
import { useTranslation } from 'react-i18next';

interface FleetAgeBracketChartProps {
  data: Omit<FleetAgeBracket, 'label'>[];
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

  const bracketLabels: Record<string, string> = {
      '0-3': t('age_bracket_new'),
      '4-7': t('age_bracket_semi_new'),
      '8-12': t('age_bracket_used'),
      '13+': t('age_bracket_old'),
  };

  const chartConfig = {
    quantity: {
      label: t('quantity'),
      color: 'hsl(var(--chart-2))',
    },
    [t('age_bracket_new')]: { label: t('age_bracket_new'), color: 'hsl(var(--chart-1))', icon: Sparkles },
    [t('age_bracket_semi_new')]: { label: t('age_bracket_semi_new'), color: 'hsl(var(--chart-2))', icon: Car },
    [t('age_bracket_used')]: { label: t('age_bracket_used'), color: 'hsl(var(--chart-3))', icon: Wrench },
    [t('age_bracket_old')]: { label: t('age_bracket_old'), color: 'hsl(var(--chart-4))', icon: History },
  } satisfies ChartConfig & { [key: string]: { icon: React.ComponentType<SVGProps<SVGSVGElement>> }};

  const chartData = useMemo(() => {
    const iconMap: Record<string, React.ComponentType<SVGProps<SVGSVGElement>>> = {
        '0-3': Sparkles,
        '4-7': Car,
        '8-12': Wrench,
        '13+': History,
    };
    const colorMap: Record<string, string> = {
        [t('age_bracket_new')]: 'var(--color-age_bracket_new)',
        [t('age_bracket_semi_new')]: 'var(--color-age_bracket_semi_new)',
        [t('age_bracket_used')]: 'var(--color-age_bracket_used)',
        [t('age_bracket_old')]: 'var(--color-age_bracket_old)',
    };
    
    return data.map(item => {
        const label = bracketLabels[item.range] || item.range;
        return {
            bracket: label,
            quantity: item.quantity,
            fill: colorMap[label],
            icon: iconMap[item.range]
        }
    }).filter(d => d.quantity > 0);

  }, [data, t, bracketLabels]);

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
