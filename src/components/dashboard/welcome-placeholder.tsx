
'use client';

import { Car, Wrench, Truck, Filter, Factory, Store, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DynamicWelcomeText from './dynamic-welcome-text';
import { useEffect, useState } from 'react';

const MotorcycleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        {...props}
    >
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="18.5" cy="17.5" r="2.5" />
        <path d="M12 6h3.5a3 3 0 0 1 3 3v5" />
        <path d="M12 17.5h-2.5l-3-4-2-3h5.5" />
        <path d="m15 6-3 4" />
    </svg>
);


const icons = [
    <Car key="car" className="w-12 h-12 text-primary" />,
    <Truck key="truck" className="w-12 h-12 text-accent" />,
    <MotorcycleIcon key="motorcycle" className="w-12 h-12 text-primary" />,
    <Wrench key="wrench" className="w-12 h-12 text-accent" />,
    <Filter key="filter" className="w-12 h-12 text-primary" />,
    <Factory key="factory" className="w-12 h-12 text-accent" />,
    <Store key="store" className="w-12 h-12 text-primary" />,
    <Package key="package" className="w-12 h-12 text-accent" />,
];

const WelcomePlaceholder = () => {
    const { t } = useTranslation();
    const [currentIconIndex, setCurrentIconIndex] = useState(0);

     useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIconIndex((prevIndex) => (prevIndex + 1) % icons.length);
        }, 2000); // Change icon every 2 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card h-full p-8">
            <div className="text-center max-w-md mx-auto">
                <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
                    {/* Pulsating background circles */}
                    <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
                    <div className="absolute inset-8 bg-primary/10 rounded-full animate-pulse [animation-delay:200ms]"></div>
                    <div className="absolute inset-16 bg-primary/5 rounded-full animate-pulse [animation-delay:400ms]"></div>
                    
                    {/* Animated icons */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                         {icons.map((icon, index) => (
                            <div
                                key={index}
                                className={`absolute transition-opacity duration-1000 ${
                                    index === currentIconIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                {icon}
                            </div>
                        ))}
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
