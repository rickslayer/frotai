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
      const result = await generateInitialSearchFilters({
        userLocation: 'São Paulo, Brazil',
        recentSearchHistory: 'Searched for Toyota Corolla and Honda Civic',
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
    onApplyFilters({
      state: suggestion.state || 'all',
      city: suggestion.city || 'all',
      manufacturer: suggestion.manufacturer || 'all',
      model: suggestion.model || 'all',
      version: suggestion.version || 'all',
    });
     toast({
        title: t('filters_applied'),
        description: t('showing_results_for', { manufacturer: suggestion.manufacturer, model: suggestion.model }),
      });
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={handleGetSuggestions} disabled={loading} variant="outline" size="sm">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {t('get_ai_suggestions')}
        </Button>
        <p className="text-sm text-muted-foreground hidden md:block">
          {t('get_ai_suggestions_description')}
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => applySuggestion(s)}
              className="transform transition-transform hover:scale-105"
            >
              <Badge variant="secondary" className="cursor-pointer px-3 py-1 text-sm">
                {`${s.manufacturer} ${s.model} in ${s.city}`}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSuggestions;
