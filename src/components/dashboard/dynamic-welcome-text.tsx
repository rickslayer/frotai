
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { textToSpeech } from '@/ai/flows/text-to-speech';

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
    
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);


    // Load sound preference from localStorage
    useEffect(() => {
        const savedSoundPref = localStorage.getItem('frotai-sound-enabled');
        if (savedSoundPref) {
            setIsSoundEnabled(JSON.parse(savedSoundPref));
        }
    }, []);

    // Load messages based on titleKey
    useEffect(() => {
        const messageKey = welcomeMessageKeys[titleKey] || 'welcome_messages_start';
        const loadedMessages = t(messageKey, { returnObjects: true }) as string[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            setMessages(loadedMessages);
            setCurrentIndex(Math.floor(Math.random() * loadedMessages.length));
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
    
    // Audio generation and playback effect
    const generateAndPlayAudio = useCallback(async (text: string) => {
        if (!isSoundEnabled || !text) return;
        
        setIsAudioLoading(true);
        setAudioUrl(null);
        try {
            const response = await textToSpeech(text);
            if (response.media) {
                setAudioUrl(response.media);
            }
        } catch (error) {
            console.error("Failed to generate speech:", error);
            // Don't show a toast to the user, just fail silently.
        } finally {
            setIsAudioLoading(false);
        }
    }, [isSoundEnabled]);
    
    useEffect(() => {
        if (messages[currentIndex]) {
            generateAndPlayAudio(messages[currentIndex]);
        }
    }, [currentIndex, messages, generateAndPlayAudio]);

    useEffect(() => {
        if (audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
        }
    }, [audioUrl]);


    const toggleSound = () => {
        const newSoundState = !isSoundEnabled;
        setIsSoundEnabled(newSoundState);
        localStorage.setItem('frotai-sound-enabled', JSON.stringify(newSoundState));
        if (!newSoundState) {
            setAudioUrl(null);
        }
    };


    if (messages.length === 0) {
        return <p className="text-muted-foreground mt-2 h-6">{t('welcome_subtitle')}</p>;
    }

    return (
        <div className="relative">
            <p className={cn(
                "text-muted-foreground transition-opacity duration-500 ease-in-out h-10 flex items-center justify-center text-center",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}>
                {messages[currentIndex]}
            </p>
            <div className="absolute top-0 right-0 -mt-8">
                 <Button onClick={toggleSound} variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    {isAudioLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSoundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                    ) : (
                        <VolumeX className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {audioUrl && <audio ref={audioRef} src={audioUrl} hidden />}
        </div>
    );
};

export default DynamicWelcomeText;
