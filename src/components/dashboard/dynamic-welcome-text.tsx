
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
    welcome_title_location_needs_vehicle_details: 'welcome_messages_location_needs_vehicle_details',
};

const DynamicWelcomeText = ({ titleKey }: DynamicWelcomeTextProps) => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Load messages based on titleKey
    useEffect(() => {
        const messageKey = welcomeMessageKeys[titleKey] || 'welcome_messages_start';
        const loadedMessages = t(messageKey, { returnObjects: true }) as string[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            setMessages(loadedMessages);
            setCurrentIndex(0); 
        }
    }, [t, titleKey]);

    // Text animation interval
    useEffect(() => {
        if (messages.length === 0) return;

        const intervalId = setInterval(() => {
            setIsVisible(false); // Start fade-out

            setTimeout(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
                setIsVisible(true); // Start fade-in with new text
            }, 500); // Wait for fade-out animation
        }, 4000); // Change phrase every 4 seconds

        return () => clearInterval(intervalId);
    }, [messages]);
    

    if (messages.length === 0) {
        return <p className="text-muted-foreground mt-2 h-6">{t('welcome_subtitle')}</p>;
    }

    const currentMessage = messages[currentIndex];

    return (
        <div className="relative">
            <p className={cn(
                "text-muted-foreground transition-opacity duration-500 ease-in-out h-10 flex items-center justify-center text-center",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}>
                {currentMessage}
            </p>
        </div>
    );
};

export default DynamicWelcomeText;
