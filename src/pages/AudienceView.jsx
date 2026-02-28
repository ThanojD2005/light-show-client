import React, { useEffect, useState } from 'react';
import { useShow } from '../context/ShowContext';

const AudienceView = () => {
    const { showState } = useShow();
    const [localColor, setLocalColor] = useState('#000000');
    const [isInitializing, setIsInitializing] = useState(true);

    // Smooth entrance
    useEffect(() => {
        const t = setTimeout(() => setIsInitializing(false), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (showState.isActive && (showState.color || showState.effect === 'rainbow')) {
            // For rainbow, we need a base color for hue-rotate to work
            if (showState.effect === 'rainbow' && (showState.color === '#000000' || !showState.color)) {
                setLocalColor('#ff0000'); // Base red for rainbow
            } else {
                setLocalColor(showState.color);
            }
        } else {
            setLocalColor('#000000');
        }
    }, [showState.isActive, showState.color, showState.id]);

    const getContainerClasses = () => {
        let classes = 'min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-[150ms] overflow-hidden fixed inset-0';

        if (showState.isActive) {
            if (showState.effect === 'strobe') {
                classes += ' animate-strobe';
            } else if (showState.effect === 'pulse') {
                classes += ' animate-pulse-fast';
            } else if (showState.effect === 'glitch') {
                classes += ' animate-glitch';
            } else if (showState.effect === 'rainbow') {
                classes += ' animate-rainbow';
            } else if (showState.effect === 'blink') {
                classes += ' animate-blink';
            } else if (showState.effect === 'breathe') {
                classes += ' animate-breathe';
            }
        }

        return classes;
    };

    return (
        <div
            className={getContainerClasses()}
            style={{
                backgroundColor: localColor,
                opacity: isInitializing ? 0 : 1,
                transition: isInitializing ? 'opacity 1s ease-out' : 'background-color 0.15s ease-out'
            }}
        >
            {/* Waiting screen UI */}
            {!showState.isActive && (
                <div className="flex flex-col items-center justify-center h-full w-full px-6 absolute inset-0 text-center font-sans">

                    {/* Abstract pulsating orb */}
                    <div className="relative w-40 h-40 flex items-center justify-center mb-12">
                        <div className="absolute inset-0 bg-white blur-[80px] opacity-20 animate-pulse rounded-full"></div>
                        <div className="absolute w-20 h-20 border-[1px] border-white/30 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
                        <div className="absolute w-12 h-12 bg-white rounded-full shadow-[0_0_40px_rgba(255,255,255,1)]"></div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-white drop-shadow-2xl">
                        STAND BY
                    </h1>
                    <p className="text-gray-400 font-medium tracking-wide max-sm mx-auto text-sm leading-relaxed mb-12 opacity-80">
                        Please keep this tab open and your device awake. Maximize your screen brightness for the best experience.
                    </p>

                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em]">Connected to Stage</span>
                    </div>

                </div>
            )}

            {/* Pure active color projection - absolutely zero UI for maximum immersion */}
        </div>
    );
};

export default AudienceView;
