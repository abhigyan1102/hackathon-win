'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Strips markdown code fences and attempts to parse the AI's JSON response,
 * returning only the "answer" field so the voice doesn't read raw JSON.
 */
function extractSpeakableText(raw: string): string {
    try {
        const clean = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return parsed.answer || raw;
    } catch {
        return raw;
    }
}

/**
 * Pick the best available voice:
 * 1. Google en-US voice (premium quality)
 * 2. Any voice with "Premium" in the name
 * 3. Any natural-sounding en-US voice
 * 4. First en-US voice available
 * 5. Default (null)
 */
function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    const google = enVoices.find(v => v.name.includes('Google'));
    if (google) return google;

    const premium = enVoices.find(v => v.name.includes('Premium'));
    if (premium) return premium;

    const natural = enVoices.find(v => v.name.includes('Natural') || v.name.includes('Enhanced'));
    if (natural) return natural;

    const enUS = enVoices.find(v => v.lang === 'en-US');
    if (enUS) return enUS;

    return enVoices[0] || null;
}

interface UseTextToSpeechReturn {
    speak: (raw: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    isMuted: boolean;
    toggleMute: () => void;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

    // Load voices (they arrive asynchronously in most browsers)
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                selectedVoiceRef.current = selectBestVoice(voices);
            }
        };

        loadVoices();
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
    }, []);

    const speak = useCallback(
        (raw: string) => {
            if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

            const text = extractSpeakableText(raw);
            if (!text.trim()) return;

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.05;
            utterance.volume = 1;

            if (selectedVoiceRef.current) {
                utterance.voice = selectedVoiceRef.current;
            }

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        },
        [isMuted]
    );

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            if (!prev) {
                if (typeof window !== 'undefined') {
                    window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
            }
            return !prev;
        });
    }, []);

    return { speak, stop, isSpeaking, isMuted, toggleMute };
}
