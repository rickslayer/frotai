
'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DynamicWelcomeTextProps {
    titleKey: string;
}

const welcomeMessageKeys: Record<string, string> = {
    welcome_title_start: 'welcome_messages_start',
    welcome_title_location_needs_state: 'welcome_messages_location_needs_state',
    welcome_title_vehicle_needs_region: 'welcome_messages_vehicle_needs_region',
    welcome_title_vehicle_needs_model: 'welcome_messages_vehicle_needs_model',
};


const DynamicWelcomeText = ({ titleKey }: DynamicWelcomeTextProps) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const messageKey = welcomeMessageKeys[titleKey] || 'welcome_messages_start';
        const loadedMessages = t(messageKey, { returnObjects: true }) as string[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            setMessages(loadedMessages);
            setCurrentIndex(Math.floor(Math.random() * loadedMessages.length));
        }
    }, [t, titleKey]);

    useEffect(() => {
        if (messages.length === 0) return;

        const intervalId = setInterval(() => {
            setIsVisible(false); // Inicia o fade-out

            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
                setIsVisible(true); // Inicia o fade-in com o novo texto
            }, 500); // Espera a animação de fade-out terminar
        }, 4000); // Muda a frase a cada 4 segundos

        return () => clearInterval(intervalId);
    }, [messages]);

    if (messages.length === 0) {
        return <p className="text-muted-foreground mt-2 h-6">{t('welcome_subtitle')}</p>;
    }

    return (
        <p className={cn(
            "text-muted-foreground transition-opacity duration-500 ease-in-out h-10 flex items-center justify-center",
            isVisible ? 'opacity-100' : 'opacity-0'
        )}>
            {messages[currentIndex]}
        </p>
    );
};

export default DynamicWelcomeText;
