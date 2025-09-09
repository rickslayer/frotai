
'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const DynamicWelcomeText = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Acessa o array de mensagens da tradução. 
        // `i18next.t` com a opção `returnObjects: true` retorna o array em vez de uma string.
        const loadedMessages = t('welcome_messages', { returnObjects: true }) as string[];
        if (Array.isArray(loadedMessages) && loadedMessages.length > 0) {
            setMessages(loadedMessages);
            // Inicia com um índice aleatório
            setCurrentIndex(Math.floor(Math.random() * loadedMessages.length));
        }
    }, [t]);

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
            "text-muted-foreground transition-opacity duration-500 ease-in-out h-6",
            isVisible ? 'opacity-100' : 'opacity-0'
        )}>
            {messages[currentIndex]}
        </p>
    );
};

export default DynamicWelcomeText;
