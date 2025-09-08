'use client';

import { useState } from 'react';
import type { FC } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { generateInitialSearchFilters, type InitialSearchFilters } from '@/ai/flows/generate-initial-search-filters';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import type { Filters } from '@/types';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Terminal } from 'lucide-react';

interface FilterSuggestionsProps {
  onApplyFilters: (newFilters: Partial<Filters>) => void;
}

const FilterSuggestions: FC<FilterSuggestionsProps> = ({ onApplyFilters }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<InitialSearchFilters[]>([]);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setLoading(true);
    setSuggestions([]);
    try {
      // In a real app, this data would come from the database or user context
      const result = await generateInitialSearchFilters({
        userRegion: 'Sudeste',
        commonModels: ['Strada', 'Onix', 'Polo', 'HB20', 'Corolla', 'Compass'],
      });
      setSuggestions(result);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('ai_suggestions_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: InitialSearchFilters) => {
    const filtersToApply: Partial<Filters> = {
        state: suggestion.state || 'all',
        city: suggestion.city || 'all',
        manufacturer: suggestion.manufacturer || 'all',
        model: suggestion.model || 'all',
        year: 'all'
    };
    onApplyFilters(filtersToApply);
    setSuggestions([]);
     toast({
        title: t('filters_applied'),
        description: t('showing_results_for_suggestion', { description: suggestion.description }),
      });
  };

  return (
    <div className='space-y-4'>
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 space-y-2 sm:space-y-0">
        <Button onClick={handleGetSuggestions} disabled={loading} variant="default" size="sm">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {t('get_ai_suggestions')}
        </Button>
        <p className="text-sm text-muted-foreground">
          {t('get_ai_suggestions_description')}
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{t('generating_suggestions')}</span>
        </div>
      )}

      {suggestions.length > 0 && !loading && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>{t('suggestions_title')}</AlertTitle>
          <AlertDescription>
            <p className='mb-3'>{t('suggestions_description')}</p>
             <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <Badge
                  key={i}
                  onClick={() => applySuggestion(s)}
                  variant="secondary"
                  className="cursor-pointer px-3 py-1.5 text-sm font-normal transition-transform hover:scale-105 hover:bg-secondary/90 active:scale-100"
                >
                  {s.description}
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FilterSuggestions;
