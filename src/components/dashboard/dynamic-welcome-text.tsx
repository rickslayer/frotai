
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
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isVisible, setIsVisible] = useState(true);

    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioCache, setAudioCache] = useState<Record<string, string>>({});
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Effect to load sound preference from localStorage
    useEffect(() => {
        const storedPreference = localStorage.getItem('soundEnabled');
        if (storedPreference !== null) {
            setIsSoundEnabled(JSON.parse(storedPreference));
        } else {
            setIsSoundEnabled(true); // Default to on
        }
    }, []);
    
    // Function to handle speaking
    const speak = useCallback(async (text: string) => {
        if (!isSoundEnabled || isSpeaking) return;

        setIsSpeaking(true);
        try {
            let audioSrc = audioCache[text];
            if (!audioSrc) {
                audioSrc = await textToSpeech(text);
                setAudioCache(prev => ({ ...prev, [text]: audioSrc }));
            }
            if (audioRef.current) {
                audioRef.current.src = audioSrc;
                await audioRef.current.play();
            }
        } catch (error) {
            console.error('Error during speech synthesis:', error);
        } finally {
            setIsSpeaking(false);
        }
    }, [isSoundEnabled, isSpeaking, audioCache]);


    // Load messages based on titleKey
    useEffect(() => {
        const messageKey = welcomeMessageKeys[titleKey] || 'welcome_messages_start';
        const loadedMessages = t(messageKey, { returnObjects: true }) as string[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            setMessages([t('welcome_greeting'), ...loadedMessages]);
            setCurrentIndex(0); 
        }
    }, [t, titleKey]);

    // Text animation and speech synthesis interval
    useEffect(() => {
        if (messages.length === 0 || currentIndex === -1) return;

        // Speak the first message immediately
        const firstMessage = messages[0];
        speak(firstMessage);

        const intervalId = setInterval(() => {
            setIsVisible(false); // Start fade-out

            setTimeout(() => {
                const nextIndex = (currentIndex + 1) % messages.length;
                setCurrentIndex(nextIndex);
                const nextMessage = messages[nextIndex];
                speak(nextMessage); // Speak the new message
                setIsVisible(true); // Start fade-in with new text
            }, 500); // Wait for fade-out animation
        }, 15000); // Change phrase every 15 seconds

        return () => clearInterval(intervalId);
    }, [messages, speak, currentIndex]); // Rerun when messages array changes or speak function updates
    
    const handleToggleSound = () => {
        const newSoundState = !isSoundEnabled;
        setIsSoundEnabled(newSoundState);
        localStorage.setItem('soundEnabled', JSON.stringify(newSoundState));
        if (!newSoundState && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
        }
    };

    if (messages.length === 0) {
        return <p className="text-muted-foreground mt-2 h-6">{t('welcome_subtitle')}</p>;
    }

    const currentMessage = messages[currentIndex >= 0 ? currentIndex : 0];

    return (
        <div className="relative">
            <p className={cn(
                "text-muted-foreground transition-opacity duration-500 ease-in-out h-10 flex items-center justify-center text-center",
                isVisible ? 'opacity-100' : 'opacity-0'
            )}>
                {currentMessage}
            </p>
             <div className="flex justify-center mt-4">
                <Button onClick={handleToggleSound} variant="ghost" size="icon" className="text-muted-foreground">
                    {isSpeaking ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isSoundEnabled ? (
                        <Volume2 className="h-6 w-6" />
                    ) : (
                        <VolumeX className="h-6 w-6" />
                    )}
                </Button>
            </div>
             <audio ref={audioRef} onEnded={() => setIsSpeaking(false)} className="hidden" />
        </div>
    );
};

export default DynamicWelcomeText;
