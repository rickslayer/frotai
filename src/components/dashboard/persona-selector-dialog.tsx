
'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import type { Persona } from '@/types';
import { Factory, Handshake, Truck, Store, Wrench } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface PersonaSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonaSelect: (persona: Persona) => void;
  onGoBack: () => void;
}

const personas: { id: Persona; labelKey: string; descriptionKey: string; icon: React.ElementType }[] = [
  { id: 'manufacturer', labelKey: 'persona_manufacturer', descriptionKey: 'persona_manufacturer_desc', icon: Factory },
  { id: 'representative', labelKey: 'persona_representative', descriptionKey: 'persona_representative_desc', icon: Handshake },
  { id: 'distributor', labelKey: 'persona_distributor', descriptionKey: 'persona_distributor_desc', icon: Truck },
  { id: 'retailer', labelKey: 'persona_retailer', descriptionKey: 'persona_retailer_desc', icon: Store },
  { id: 'mechanic', labelKey: 'persona_mechanic', descriptionKey: 'persona_mechanic_desc', icon: Wrench },
];

const PersonaSelectorDialog: FC<PersonaSelectorDialogProps> = ({ open, onOpenChange, onPersonaSelect, onGoBack }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('persona_dialog_title')}</DialogTitle>
          <DialogDescription>
            {t('persona_dialog_description')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          {personas.map(({ id, labelKey, descriptionKey, icon: Icon }) => (
            <Card 
              key={id}
              className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => onPersonaSelect(id)}
            >
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t(labelKey)}</CardTitle>
                  <CardDescription className="text-xs mt-1">{t(descriptionKey)}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <DialogFooter>
           <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaSelectorDialog;
