
'use client';

import { Car, MapPin, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DynamicWelcomeText from './dynamic-welcome-text';

const WelcomePlaceholder = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card h-full p-8">
            <div className="text-center max-w-md mx-auto">
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                    {/* Pulsating background circles */}
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
                    <div className="absolute inset-8 bg-primary/10 rounded-full animate-pulse [animation-delay:200ms]"></div>
                    <div className="absolute inset-16 bg-primary/5 rounded-full animate-pulse [animation-delay:400ms]"></div>
                    
                    {/* Animated icons */}
                    <div className="absolute top-[20%] left-[50%] -translate-x-1/2 animate-fade-in-out [animation-delay:0s]">
                        <Car className="w-8 h-8 text-primary" />
                    </div>
                    <div className="absolute top-[45%] left-[25%] animate-fade-in-out [animation-delay:1s]">
                        <Wrench className="w-7 h-7 text-accent" />
                    </div>
                    <div className="absolute top-[70%] left-[75%] animate-fade-in-out [animation-delay:2s]">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                     <div className="absolute top-[45%] left-[70%] animate-fade-in-out [animation-delay:3s]">
                        <Wrench className="w-7 h-7 text-accent" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                    {t('welcome_title')}
                </h2>
                <DynamicWelcomeText />
            </div>
        </div>
    );
};

export default WelcomePlaceholder;
