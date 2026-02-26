'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export function useSpeechToText(onTranscriptReady: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Mic error:', event.error);
            if (event.error === 'not-allowed') {
                alert(
                    'Microphone access blocked. Please click the lock icon in your URL bar and allow microphone access.'
                );
            }
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.trim()) {
                onTranscriptReady(transcript);
            }
        };

        recognitionRef.current = recognition;
    }, [onTranscriptReady]);

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (e) {
                console.error('Already started');
            }
        }
    }, [isListening]);

    return { isListening, toggleListening };
}
