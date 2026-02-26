"use client";

import { useEffect, useState } from "react";
import HamsterLoader from "./HamsterLoader";

export default function Providers({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        // Start fading out after 2000ms
        const timer = setTimeout(() => {
            setFading(true);

            // Completely remove it from DOM after the transition duration (500ms)
            const removeTimer = setTimeout(() => {
                setLoading(false);
            }, 500);

            return () => clearTimeout(removeTimer);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            {loading && (
                <div
                    className={`fixed inset-0 z-[100] transition-opacity duration-500 origin-center ${fading ? "opacity-0 pointer-events-none" : "opacity-100"
                        }`}
                >
                    <HamsterLoader />
                </div>
            )}
            {children}
        </>
    );
}
