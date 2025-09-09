'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { predictPartsDemand } from '@/ai/flows/predict-parts-demand';
import type { Filters, FleetAgeBracket, PredictPartsDemandOutput } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Lightbulb, Wrench, Package, Loader2 } from 'lucide-react';

interface PartDemandForecastProps {
  fleetAgeBrackets: FleetAgeBracket[];
  filters: Filters;
  disabled: boolean;
}

const PartDemandForecast: FC<PartDemandForecastProps> = ({ fleetAgeBrackets, filters, disabled }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [partCategory, setPartCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictPartsDemandOutput | null>(null);

  const handlePredictDemand = async () => {
    setLoading(true);
    setResult(null);
    try {
      const demand = await predictPartsDemand({
        fleetAgeBrackets,
        partCategory,
        filters: {
            manufacturer: filters.manufacturer,
            model: filters.model
        }
      });
      setResult(demand);
    } catch (error) {
      console.error('Error predicting parts demand:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('part_demand_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (level: 'Alta' | 'Média' | 'Baixa') => {
    switch (level) {
      case 'Alta':
        return 'bg-red-500 hover:bg-red-500';
      case 'Média':
        return 'bg-yellow-500 hover:bg-yellow-500';
      case 'Baixa':
        return 'bg-green-500 hover:bg-green-500';
      default:
        return 'bg-secondary';
    }
  };


  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{t('part_demand_forecast_title')}</CardTitle>
        <CardDescription>{t('part_demand_forecast_description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4">
        <div className="space-y-2">
          <Input
            placeholder={t('part_category_placeholder')}
            value={partCategory}
            onChange={(e) => setPartCategory(e.target.value)}
            disabled={disabled || loading}
          />
          <Button onClick={handlePredictDemand} disabled={disabled || loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
            {t('predict_demand_button')}
          </Button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('predicting_demand_loading')}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4 pt-4 overflow-y-auto max-h-[400px]">
            {result.predictions.length > 0 ? (
                result.predictions.map((pred, index) => (
                <Alert key={index} className="flex flex-col">
                    <div className='flex items-start gap-3'>
                        <Lightbulb className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1">
                            <div className='flex justify-between items-center mb-1 gap-2'>
                                <AlertTitle className='text-base'>{pred.partName}</AlertTitle>
                                 <Badge variant="default" className={`flex-shrink-0 ${getDemandColor(pred.demandLevel)}`}>
                                    {t('demand_level', { level: pred.demandLevel })}
                                </Badge>
                            </div>
                            <AlertDescription className="space-y-2">
                                <p>{pred.reason}</p>
                                <p className='font-semibold text-foreground flex items-start gap-2'>
                                    <Package className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                                    <span>{pred.opportunity}</span>
                                </p>
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
                ))
            ) : (
                <Alert>
                    <AlertTitle>{t('no_opportunities_found_title')}</AlertTitle>
                    <AlertDescription>{t('no_opportunities_found_description')}</AlertDescription>
                </Alert>
            )}
          </div>
        ) : (
          !loading && disabled && (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-grow">
                <Wrench className="h-10 w-10 mb-2 text-primary/30" />
                <p className='font-semibold text-base'>{t('part_demand_disabled_title')}</p>
                <p className='text-sm'>{t('part_demand_disabled_description')}</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default PartDemandForecast;
