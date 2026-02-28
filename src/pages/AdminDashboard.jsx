import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useShow } from '../context/ShowContext';
import AudioController from '../components/AudioController';
import { Play, Pause, Square, Zap, Radio, Moon, Sun, Power, Edit2 } from 'lucide-react';

const INITIAL_COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Teal', value: '#14b8a6' },
];

const AdminDashboard = () => {
    const { showState, triggerStateUpdate } = useShow();
    const [palette, setPalette] = useState(INITIAL_COLORS);
    const [selectedColor, setSelectedColor] = useState(INITIAL_COLORS[0].value);
    const colorInputRef = useRef(null);
    const [editingIndex, setEditingIndex] = useState(null);

    // Callbacks for stability
    const handleColorSelect = useCallback((colorValue) => {
        setSelectedColor(colorValue);
        if (showState.isActive) {
            triggerStateUpdate({ color: colorValue, id: Date.now() });
        }
    }, [showState.isActive, triggerStateUpdate]);

    const toggleShow = useCallback(() => {
        if (showState.isActive) {
            triggerStateUpdate({ isActive: false, effect: 'none', id: Date.now() });
        } else {
            triggerStateUpdate({ isActive: true, color: selectedColor, effect: 'none', id: Date.now() });
        }
    }, [showState.isActive, selectedColor, triggerStateUpdate]);

    const triggerEffect = useCallback((effectName) => {
        if (!showState.isActive) return;
        triggerStateUpdate({ effect: effectName, color: selectedColor, id: Date.now() });
    }, [showState.isActive, selectedColor, triggerStateUpdate]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            const key = e.key;

            // Colors 1-9
            if (key >= '1' && key <= '9') {
                const index = parseInt(key) - 1;
                if (palette[index]) {
                    handleColorSelect(palette[index].value);
                }
            }
            // Key 0 for White
            else if (key === '0') {
                handleColorSelect('#ffffff');
            }
            // Effects
            else if (key.toLowerCase() === 's') triggerEffect('strobe');
            else if (key.toLowerCase() === 'p') triggerEffect('pulse');
            else if (key.toLowerCase() === 'g') triggerEffect('glitch');
            else if (key.toLowerCase() === 'r') triggerEffect('rainbow');
            else if (key.toLowerCase() === 'b') triggerEffect('blink');
            else if (key.toLowerCase() === 'l') triggerEffect('breathe');
            else if (key.toLowerCase() === 'o') triggerEffect('none');

            // Master Toggle
            else if (key === ' ') {
                e.preventDefault();
                toggleShow();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [palette, handleColorSelect, toggleShow, triggerEffect]);

    const openColorPicker = (index, e) => {
        e.stopPropagation();
        setEditingIndex(index);
        if (colorInputRef.current) {
            colorInputRef.current.value = palette[index].value;
            colorInputRef.current.click();
        }
    };

    const handleColorEdit = (e) => {
        const newValue = e.target.value;
        if (editingIndex !== null) {
            const newPalette = [...palette];
            newPalette[editingIndex] = { ...newPalette[editingIndex], value: newValue };
            setPalette(newPalette);

            // If the edited color was the selected one, update it
            if (selectedColor === palette[editingIndex].value) {
                setSelectedColor(newValue);
                if (showState.isActive) {
                    triggerStateUpdate({ color: newValue, id: Date.now() });
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-12 px-4 font-sans selection:bg-primary/30">
            {/* Hidden Color Input */}
            <input
                type="color"
                ref={colorInputRef}
                onChange={handleColorEdit}
                className="hidden"
            />

            {/* Header */}
            <header className="w-full max-w-4xl flex items-center justify-between mb-12">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_-5px_var(--tw-shadow-color)] shadow-primary">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Stage Control</h1>
                        <p className="text-sm font-medium text-gray-400">Light Show Director</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 backdrop-blur-md">
                    <div className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${showState.isActive ? 'bg-red-400' : 'bg-green-400'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${showState.isActive ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]'}`}></span>
                    </div>
                    <span className="text-sm font-bold tracking-wide uppercase">
                        {showState.isActive ? 'On Air' : 'Standby'}
                    </span>
                </div>
            </header>

            {/* Main Grid Area */}
            <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="md:col-span-2">
                    <AudioController />
                </div>

                {/* Colors Panel */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-200">
                        <Sun className="w-5 h-5" /> Color Palette
                    </h2>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-6">
                        {palette.map((color, index) => (
                            <div key={index} className="flex flex-col items-center gap-2 group relative">
                                <button
                                    onClick={() => handleColorSelect(color.value)}
                                    className={`
                                        w-14 h-14 rounded-full transition-all duration-300 ease-out border-2 relative
                                        ${selectedColor === color.value
                                            ? 'scale-110 border-white z-10'
                                            : 'border-transparent scale-100 hover:scale-110'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: color.value,
                                        boxShadow: selectedColor === color.value
                                            ? `0 0 30px ${color.value}80, inset 0 0 10px rgba(255,255,255,0.2)`
                                            : `0 10px 20px -5px ${color.value}40`
                                    }}
                                >
                                    {/* Keyboard Hint */}
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 backdrop-blur-md rounded-md flex items-center justify-center text-[10px] font-bold text-white border border-white/10 z-20">
                                        {index + 1}
                                    </span>

                                    {selectedColor === color.value && (
                                        <div className="absolute inset-1.5 rounded-full border border-white/40"></div>
                                    )}
                                </button>

                                {/* Edit Button */}
                                <button
                                    onClick={(e) => openColorPicker(index, e)}
                                    className="opacity-0 group-hover:opacity-100 absolute bottom-6 right-2 p-1 bg-white/10 hover:bg-white/20 rounded-full transition-all z-30 border border-white/10 shadow-lg"
                                    title="Edit color"
                                >
                                    <Edit2 className="w-3 h-3 text-white" />
                                </button>

                                <span className={`text-[10px] font-bold tracking-wider transition-colors uppercase ${selectedColor === color.value ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                    {color.name}
                                </span>
                            </div>
                        ))}

                        {/* Static White Key Hint */}
                        <div className="flex flex-col items-center gap-2 px-2">
                            <div
                                className={`w-14 h-14 rounded-full border-2 border-white/20 bg-white flex items-center justify-center opacity-50 relative`}
                                style={{ boxShadow: '0 0 10px rgba(255,255,255,0.2)' }}
                            >
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-black/60 backdrop-blur-md rounded-md flex items-center justify-center text-[10px] font-bold text-white border border-white/10">0</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">White</span>
                        </div>
                    </div>
                </div>

                {/* Effects & Master Control */}
                <div className="space-y-8 flex flex-col">
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex-1 relative overflow-hidden">
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full pointer-events-none"></div>

                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-200">
                            <Moon className="w-5 h-5" /> Special Effects
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => triggerEffect('strobe')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-300 to-white opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'strobe' ? 'bg-white text-black' : 'bg-[#111] text-white'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Strobe</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'strobe' ? 'border-black/20 bg-black/5' : 'border-white/10 bg-white/5 opacity-50'}`}>[S]</span>
                                </div>
                            </button>

                            <button
                                onClick={() => triggerEffect('pulse')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-secondary via-primary to-secondary opacity-40 group-hover:opacity-80 transition-opacity rounded-2xl"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'pulse' ? 'bg-gradient-to-r from-secondary to-primary text-white' : 'bg-[#111] text-white hover:bg-[#1a1a1a]'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Pulse</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'pulse' ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5 opacity-50'}`}>[P]</span>
                                </div>
                            </button>

                            <button
                                onClick={() => triggerEffect('glitch')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 opacity-40 group-hover:opacity-80 transition-opacity rounded-2xl"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'glitch' ? 'bg-gradient-to-tr from-red-500 to-blue-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-[#111] text-white hover:bg-[#1a1a1a]'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Glitch</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'glitch' ? 'border-white/20 bg-white/10' : 'border-white/10 bg-white/5 opacity-50'}`}>[G]</span>
                                </div>
                            </button>

                            <button
                                onClick={() => triggerEffect('rainbow')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 opacity-40 group-hover:opacity-80 transition-opacity rounded-2xl animate-rainbow"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'rainbow' ? 'bg-transparent text-white font-bold' : 'bg-[#111] text-white hover:bg-[#1a1a1a]'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Rainbow</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'rainbow' ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5 opacity-50'}`}>[R]</span>
                                </div>
                            </button>

                            <button
                                onClick={() => triggerEffect('blink')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-white opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'blink' ? 'bg-white text-black' : 'bg-[#111] text-white'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Blink</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'blink' ? 'border-black/20 bg-black/5' : 'border-white/10 bg-white/5 opacity-50'}`}>[B]</span>
                                </div>
                            </button>

                            <button
                                onClick={() => triggerEffect('breathe')}
                                disabled={!showState.isActive}
                                className="w-full relative overflow-hidden rounded-2xl p-[1px] group disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 bg-blue-400 opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></span>
                                <div className={`
                                        relative px-4 py-4 rounded-2xl flex items-center justify-between transition-colors
                                        ${showState.effect === 'breathe' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' : 'bg-[#111] text-white hover:bg-[#1a1a1a]'}
                                    `}>
                                    <span className="font-bold tracking-wider text-xs uppercase">Breathe</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${showState.effect === 'breathe' ? 'border-blue-400/20 bg-blue-400/5' : 'border-white/10 bg-white/5 opacity-50'}`}>[L]</span>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={() => triggerEffect('none')}
                            disabled={!showState.isActive}
                            className="w-full px-8 py-4 rounded-2xl bg-[#111] border border-white/10 hover:bg-[#1a1a1a] text-white font-bold tracking-[0.2em] text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                        >
                            Solid Static <span className="text-[10px] opacity-50 font-bold ml-2">[O]</span>
                        </button>
                    </div>

                    {/* Master Toggle */}
                    <button
                        onClick={toggleShow}
                        className={`
                            w-full py-6 rounded-3xl flex items-center justify-center gap-3 font-black tracking-[0.1em] text-xl transition-all duration-300 active:scale-95 shadow-2xl
                            ${showState.isActive
                                ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_20px_50px_-15px_rgba(239,68,68,0.7)]'
                                : 'bg-white text-black hover:bg-gray-100 shadow-[0_20px_50px_-15px_rgba(255,255,255,0.4)]'
                            }
                        `}
                    >
                        {showState.isActive ? (
                            <>
                                <Square className="w-7 h-7 fill-current" />
                                BLACKOUT SHOW <span className="text-sm opacity-50">[SPACE]</span>
                            </>
                        ) : (
                            <>
                                <Power className="w-7 h-7" />
                                INITIATE SYNC <span className="text-sm opacity-50">[SPACE]</span>
                            </>
                        )}
                    </button>
                </div>
            </main>

            {/* Footer Stats mock */}
            <footer className="mt-16 text-center">
                <div className="inline-flex items-center gap-6 bg-white/5 border border-white/10 rounded-full px-8 py-4 backdrop-blur-md">
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Latency</span>
                        <span className="text-green-400 font-mono font-bold text-lg">2ms</span>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 text-xs font-bold tracking-widest uppercase mb-1">Target Audience</span>
                        <span className="text-white font-mono font-bold text-lg">1,248</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AdminDashboard;
