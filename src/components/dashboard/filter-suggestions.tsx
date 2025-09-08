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
    onApplyFilters({
      state: suggestion.state || 'all',
      city: suggestion.city || 'all',
      manufacturer: suggestion.manufacturer || 'all',
      model: suggestion.model || 'all',
    });
     toast({
        title: t('filters_applied'),
        description: t('showing_results_for_suggestion', { description: suggestion.description }),
      });
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <Button onClick={handleGetSuggestions} disabled={loading} variant="default" size="sm">
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
      )}
    </div>
  );
};

export default FilterSuggestions;
