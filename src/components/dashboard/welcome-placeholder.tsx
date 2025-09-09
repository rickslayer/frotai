
'use client';
import { Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WelcomePlaceholder = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card h-full">
            <div className="text-center">
                 <div className="flex justify-center mb-4">
                    <div className="relative h-24 w-24">
                        <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-primary/20 rounded-full animate-pulse [animation-delay:200ms]"></div>
                        <div className="absolute inset-4 flex items-center justify-center bg-primary/80 text-primary-foreground rounded-full">
                            <Filter className="h-10 w-10" />
                        </div>
                    </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    {t('welcome_title')}
                </h2>
                <p className="text-muted-foreground">
                    {t('welcome_subtitle')}
                </p>
            </div>
        </div>
    );
};

export default WelcomePlaceholder;
