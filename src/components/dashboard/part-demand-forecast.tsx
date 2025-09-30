
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { predictPartsDemand } from '@/ai/flows/predict-parts-demand';
import type { Filters, FleetAgeBracket, PredictPartsDemandOutput, Persona } from '@/types';
import { Badge } from '../ui/badge';
import { Lightbulb, Wrench, Package, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import PersonaSelectorDialog from './persona-selector-dialog';
import { Separator } from '../ui/separator';


interface PartDemandForecastProps {
  fleetAgeBrackets: FleetAgeBracket[];
  filters: Filters;
  disabled: boolean;
  onDemandPredicted: (result: PredictPartsDemandOutput | null) => void;
}

const PartDemandForecast: FC<PartDemandForecastProps> = ({ fleetAgeBrackets, filters, disabled, onDemandPredicted }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [partCategory, setPartCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictPartsDemandOutput | null>(null);
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    if (disabled) return;
    setResult(null);
    onDemandPredicted(null);
    setIsPersonaDialogOpen(true);
  };

  const handlePredictDemand = async (persona: Persona) => {
    setIsPersonaDialogOpen(false);
    setLoading(true);
    try {
      const model = Array.isArray(filters.model) && filters.model.length === 1 ? filters.model[0] : '';
      
      const demand = await predictPartsDemand({
        persona,
        fleetAgeBrackets,
        partCategory,
        filters: {
            manufacturer: filters.manufacturer,
            model: model,
        }
      });
      setResult(demand);
      onDemandPredicted(demand);
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
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
      case 'Média':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800';
      case 'Baixa':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
      default:
        return 'bg-secondary text-secondary-foreground border-transparent';
    }
  };

  const cardContent = (
    <>
      <PersonaSelectorDialog
        open={isPersonaDialogOpen}
        onOpenChange={setIsPersonaDialogOpen}
        onPersonaSelect={handlePredictDemand}
        onGoBack={() => setIsPersonaDialogOpen(false)}
      />
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
          </div>

           {loading && (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground flex-grow p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-lg font-medium">{t('predicting_demand_loading')}</p>
              <p className="text-sm">{t('generating_analysis_subtitle')}</p>
            </div>
          )}

          {result ? (
            <div className="space-y-4 pt-4 overflow-y-auto max-h-[400px] flex-grow">
              {result.predictions.length > 0 ? (
                  result.predictions.map((pred, index) => (
                    <Card key={index} className="p-4">
                       <div className='flex items-start gap-4'>
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                              <div className='flex justify-between items-center mb-2 gap-2'>
                                  <h3 className='font-semibold text-foreground'>{pred.partName}</h3>
                                  <Badge variant="outline" className={`flex-shrink-0 ${getDemandColor(pred.demandLevel)}`}>
                                      {t('demand_level', { level: pred.demandLevel })}
                                  </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{pred.reason}</p>
                              <Separator />
                              <div className='mt-3 font-medium text-sm text-foreground flex items-start gap-3'>
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 flex-shrink-0 mt-0.5">
                                    <Package className='h-4 w-4 text-green-600' />
                                  </div>
                                  <p className="flex-1">{pred.opportunity}</p>
                              </div>
                          </div>
                      </div>
                    </Card>
                  ))
              ) : (
                 <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-grow p-8">
                    <Wrench className="h-10 w-10 mb-2 text-primary/30" />
                    <p className="font-semibold">{t('no_opportunities_found_title')}</p>
                    <p className="text-sm">{t('no_opportunities_found_description')}</p>
                </div>
              )}
            </div>
          ) : (
            !loading && !disabled && (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground flex-grow p-8">
                  <Wrench className="h-12 w-12 mb-4 text-primary/30" />
                  <p>{t('part_demand_initial_prompt')}</p>
              </div>
            )
          )}
        </CardContent>
         <CardFooter className="border-t pt-6">
            <Button onClick={handleOpenDialog} disabled={disabled || loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
              {loading ? t('predicting_demand_loading') : t('predict_demand_button')}
            </Button>
        </CardFooter>
      </Card>
    </>
  );

  if (disabled) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className='h-full cursor-not-allowed'>
                         <div className="relative h-full pointer-events-none opacity-50">
                            {cardContent}
                         </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('part_demand_disabled_description')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

  return cardContent;
};

export default PartDemandForecast;
