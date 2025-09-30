
'use client';

import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import type { Persona } from '@/types';
import { Factory, Handshake, Truck, Store, Wrench } from 'lucide-react';

interface PersonaSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonaSelect: (persona: Persona) => void;
  onGoBack: () => void;
}

const personas: { id: Persona; labelKey: string; icon: React.ElementType }[] = [
  { id: 'manufacturer', labelKey: 'persona_manufacturer', icon: Factory },
  { id: 'representative', labelKey: 'persona_representative', icon: Handshake },
  { id: 'distributor', labelKey: 'persona_distributor', icon: Truck },
  { id: 'retailer', labelKey: 'persona_retailer', icon: Store },
  { id: 'mechanic', labelKey: 'persona_mechanic', icon: Wrench },
];

const PersonaSelectorDialog: FC<PersonaSelectorDialogProps> = ({ open, onOpenChange, onPersonaSelect, onGoBack }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('persona_dialog_title')}</DialogTitle>
          <DialogDescription>{t('persona_dialog_description')}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {personas.map(({ id, labelKey, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => onPersonaSelect(id)}
            >
              <Icon className="h-6 w-6 text-primary" />
              <span>{t(labelKey)}</span>
            </Button>
          ))}
        </div>
        <DialogFooter className='sm:justify-between'>
          <Button variant="ghost" onClick={onGoBack}>
            {t('persona_dialog_back_to_filters')}
          </Button>
           <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonaSelectorDialog;
