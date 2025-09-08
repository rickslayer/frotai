'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Send, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { answerFleetQuestion } from '@/ai/flows/answer-fleet-question';
import type { Filters, Vehicle } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface FleetQADialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  fleetData: Vehicle[];
  filters: Filters;
}

const FleetQADialog: FC<FleetQADialogProps> = ({
  isOpen,
  onOpenChange,
  fleetData,
  filters,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  const getFilterDescription = () => {
    const activeFilters = Object.entries(filters)
      .filter(([, value]) => value !== 'all')
      .map(([key, value]) => `${t(key)}: ${value}`)
      .join(', ');
    return activeFilters ? `${t('active_filters')}: ${activeFilters}` : t('no_active_filters');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer('');
    try {
      const result = await answerFleetQuestion({
        question,
        data: fleetData,
      });
      setAnswer(result.answer);
    } catch (error) {
      console.error('Error getting answer from AI:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('ai_answer_error'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('ask_ai_title')}
          </DialogTitle>
          <DialogDescription>{getFilterDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('ai_question_placeholder')}
              disabled={loading}
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={loading || !question.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>

          {answer && (
            <Alert>
              <AlertTitle>{t('ai_answer')}</AlertTitle>
              <AlertDescription>{answer}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FleetQADialog;
