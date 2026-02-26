import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import { useShow } from '../context/ShowContext';
import {
    Upload, Play, Pause, Music, Volume2, Loader2, CheckCircle,
    Circle, Square, Save, Trash2, RadioTower, Zap, Layers, X, Check
} from 'lucide-react';

const PALETTE = [
    '#ef4444', '#f97316', '#eab308', '#10b981',
    '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff',
];

const EFFECTS = ['none', 'pulse', 'strobe'];

// --- Event Edit Popover ---
const EventEditPopover = ({ event, index, onUpdate, onDelete, onClose, style }) => {
    const [color, setColor] = useState(event.color);
    const [effect, setEffect] = useState(event.effect || 'none');
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [onClose]);

    const handleSave = () => { onUpdate(index, { ...event, color, effect }); onClose(); };

    return (
        <div
            ref={ref}
            className="absolute z-50 bg-[#111] border border-white/15 rounded-2xl p-4 shadow-2xl w-56"
            style={style}
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Edit Event</span>
                <div className="flex gap-2">
                    <button onClick={onDelete.bind(null, index)} className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Time badge */}
            <p className="text-[10px] text-gray-600 font-mono mb-3">@ {event.time.toFixed(3)}s</p>

            {/* Color Picker */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Color</p>
            <div className="grid grid-cols-4 gap-2 mb-4">
                {PALETTE.map(c => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                            backgroundColor: c,
                            borderColor: color === c ? '#fff' : 'transparent',
                            boxShadow: color === c ? `0 0 10px ${c}80` : 'none',
                        }}
                    />
                ))}
            </div>

            {/* Effect Selector */}
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Effect</p>
            <div className="flex gap-2 mb-4">
                {EFFECTS.map(ef => (
                    <button
                        key={ef}
                        onClick={() => setEffect(ef)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all
                            ${effect === ef ? 'bg-white text-black' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                        {ef}
                    </button>
                ))}
            </div>

            {/* Save */}
            <button
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-primary hover:bg-blue-500 text-white font-black text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
            >
                <Check className="w-3.5 h-3.5" /> APPLY
            </button>
        </div>
    );
};

// --- Timeline Visualizer ---
const TimelineVisualizer = ({ events, duration, currentTime, label, accentColor, onUpdate, onDelete }) => {
    const [activePopover, setActivePopover] = useState(null); // { index, x, y }
    const containerRef = useRef(null);

    if (!duration || duration === 0) return null;

    const handleDotClick = (e, index) => {
        e.stopPropagation();
        const rect = containerRef.current.getBoundingClientRect();
        const dotRect = e.currentTarget.getBoundingClientRect();
        // Position popover above the dot, clamped
        const left = Math.min(dotRect.left - rect.left, rect.width - 230);
        setActivePopover({ index, left });
    };

    return (
        <div className="mt-2 relative" ref={containerRef}>
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{label}</span>
                <span className="text-[10px] font-mono text-gray-600">{events.length} events</span>
            </div>
            <div className="relative w-full h-8 bg-black/40 rounded-lg overflow-visible border border-white/5">
                {/* Playhead */}
                {currentTime > 0 && (
                    <div
                        className="absolute top-0 h-full w-px bg-white/60 z-20 pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                )}
                {/* Gridlines */}
                {[0.25, 0.5, 0.75].map(pct => (
                    <div key={pct} className="absolute top-0 h-full w-px bg-white/5 pointer-events-none" style={{ left: `${pct * 100}%` }} />
                ))}
                {/* Events */}
                {events.map((event, i) => (
                    <button
                        key={i}
                        onClick={(e) => onUpdate ? handleDotClick(e, i) : undefined}
                        className={`absolute top-1 bottom-1 w-2 rounded-full z-10 transition-transform hover:scale-y-150 ${onUpdate ? 'cursor-pointer hover:ring-2 hover:ring-white/50' : 'cursor-default'}`}
                        style={{
                            left: `calc(${(event.time / duration) * 100}% - 4px)`,
                            backgroundColor: event.color || accentColor,
                            opacity: event.effect === 'strobe' ? 1 : event.effect === 'pulse' ? 0.85 : 0.65,
                            boxShadow: `0 0 6px ${event.color || accentColor}`,
                        }}
                        title={onUpdate ? `Click to edit: ${event.time.toFixed(2)}s` : `${event.time.toFixed(2)}s — ${event.effect || 'solid'}`}
                    />
                ))}
            </div>

            {/* Popover */}
            {activePopover !== null && onUpdate && (
                <EventEditPopover
                    event={events[activePopover.index]}
                    index={activePopover.index}
                    onUpdate={onUpdate}
                    onDelete={(idx) => { onDelete(idx); setActivePopover(null); }}
                    onClose={() => setActivePopover(null)}
                    style={{ top: '40px', left: `${Math.max(0, activePopover.left)}px` }}
                />
            )}
        </div>
    );
};

// --- Main Component ---
const AudioController = () => {
    const { showState, triggerStateUpdate } = useShow();
    const audioRef = useRef(null);

    const [fileName, setFileName] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingBuffer, setRecordingBuffer] = useState([]);
    const [savedScript, setSavedScript] = useState(null);
    const [mode, setMode] = useState('auto');

    const [currentTime, setCurrentTime] = useState(0);
    const prevShowStateRef = useRef(showState);

    const onPatternEvent = useCallback((event) => {
        if (!showState.isActive) return;
        triggerStateUpdate({ color: event.color, effect: event.effect, id: Date.now() });
        setTimeout(() => { triggerStateUpdate({ effect: 'none', id: Date.now() + 1 }); }, 150);
    }, [showState.isActive, triggerStateUpdate]);

    const useCustomScript = mode === 'custom' && !!savedScript;

    const { initRealtimeAudio, analyzeFullSong, isAnalyzing, patternScript, audioEnergy, isPlaying, duration } =
        useAudioAnalyzer(audioRef, onPatternEvent, savedScript, useCustomScript);

    // Capture show-state changes while recording
    useEffect(() => {
        if (!isRecording || !isPlaying || !audioRef.current) return;
        const prev = prevShowStateRef.current;
        const curr = showState;
        if (curr.id !== prev.id && (curr.color !== prev.color || curr.effect !== prev.effect)) {
            setRecordingBuffer(buf => [...buf, { time: audioRef.current.currentTime, color: curr.color, effect: curr.effect }]);
        }
        prevShowStateRef.current = showState;
    }, [showState, isRecording, isPlaying]);

    // Playhead
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const update = () => setCurrentTime(audio.currentTime);
        audio.addEventListener('timeupdate', update);
        return () => audio.removeEventListener('timeupdate', update);
    }, [audioURL]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setAudioURL(URL.createObjectURL(file));
        setSavedScript(null); setRecordingBuffer([]); setIsRecording(false); setMode('auto');
        await analyzeFullSong(file);
    };

    const togglePlayback = () => {
        if (!audioRef.current) return;
        if (!hasInitialized) { initRealtimeAudio(); setHasInitialized(true); }
        if (isPlaying) { audioRef.current.pause(); } else { audioRef.current.currentTime = 0; audioRef.current.play(); }
    };

    const startRecording = () => {
        if (!audioRef.current) return;
        setRecordingBuffer([]); setIsRecording(true); prevShowStateRef.current = showState;
        if (!hasInitialized) { initRealtimeAudio(); setHasInitialized(true); }
        audioRef.current.currentTime = 0; audioRef.current.play();
    };

    const stopRecording = () => { setIsRecording(false); if (audioRef.current) audioRef.current.pause(); };
    const saveRecording = () => {
        const sorted = [...recordingBuffer].sort((a, b) => a.time - b.time);
        setSavedScript(sorted); setMode('custom');
    };
    const discardRecording = () => { setRecordingBuffer([]); setIsRecording(false); };

    // Editing handlers for savedScript
    const handleUpdateSavedEvent = (index, updated) => {
        setSavedScript(prev => prev.map((ev, i) => i === index ? updated : ev));
    };
    const handleDeleteSavedEvent = (index) => {
        setSavedScript(prev => { const n = prev.filter((_, i) => i !== index); return n.length > 0 ? n : null; });
    };

    // Editing handlers for recordingBuffer (in-progress)
    const handleUpdateBufferEvent = (index, updated) => {
        setRecordingBuffer(prev => prev.map((ev, i) => i === index ? updated : ev));
    };
    const handleDeleteBufferEvent = (index) => {
        setRecordingBuffer(prev => prev.filter((_, i) => i !== index));
    };

    const visualizerHeight = `${Math.max(10, Math.min(100, audioEnergy * 300))}%`;
    const trackDuration = duration ? `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '--:--';

    return (
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary opacity-50" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-200">
                    <Music className="w-5 h-5 text-pink-400" /> Audio Sync
                </h2>
                <div className="flex items-end gap-1 h-6 w-16 bg-black/30 rounded-md p-1 overflow-hidden">
                    <div className="w-full bg-green-500 rounded-sm transition-all duration-75" style={{ height: visualizerHeight }} />
                </div>
            </div>

            {!audioURL ? (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-300">Upload MP3 / WAV</span>
                    <span className="text-xs text-gray-500 mt-1">Offline pattern generation + manual recording</span>
                    <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </label>
            ) : (
                <div className="space-y-5">
                    <audio ref={audioRef} src={audioURL} className="hidden" crossOrigin="anonymous" />

                    {/* Track info */}
                    <div className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/10 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary/20 animate-pulse" style={{ opacity: audioEnergy }} />
                                <Volume2 className="w-6 h-6 text-white relative z-10" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold truncate text-white max-w-[200px]">{fileName}</p>
                                {isAnalyzing ? (
                                    <p className="text-xs text-yellow-400 font-mono flex items-center gap-1 mt-1"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</p>
                                ) : (
                                    <p className="text-xs text-green-400 font-mono flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> Ready · {trackDuration}</p>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black font-mono text-white/90">{patternScript?.length || 0}</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">AI Beats</span>
                        </div>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 bg-black/30 rounded-xl p-1 border border-white/5">
                        <button onClick={() => setMode('auto')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${mode === 'auto' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Zap className="w-3.5 h-3.5" /> Auto Sync
                        </button>
                        <button onClick={() => { if (savedScript) setMode('custom'); }} disabled={!savedScript} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed ${mode === 'custom' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                            <Layers className="w-3.5 h-3.5" /> Custom Show
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={togglePlayback} disabled={isAnalyzing} className={`py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest transition-all text-sm ${isAnalyzing ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10' : isPlaying ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary text-white hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]'}`}>
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : isPlaying ? <><Pause className="w-4 h-4" />PAUSE</> : <><Play className="w-4 h-4" />PLAY</>}
                        </button>
                        {!isRecording ? (
                            <button onClick={startRecording} disabled={isAnalyzing} className="py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest transition-all text-sm bg-red-600/70 hover:bg-red-500 text-white border border-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed">
                                <Circle className="w-4 h-4 fill-current" /> RECORD
                            </button>
                        ) : (
                            <button onClick={stopRecording} className="py-4 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest transition-all text-sm bg-red-500 text-white animate-pulse">
                                <Square className="w-4 h-4 fill-current" /> STOP
                            </button>
                        )}
                    </div>

                    {/* Recording Indicator */}
                    {isRecording && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-xs font-bold text-red-400 tracking-widest uppercase">Recording — click colors &amp; effects to capture them</span>
                        </div>
                    )}

                    {/* Unsaved Recording Banner */}
                    {!isRecording && recordingBuffer.length > 0 && (
                        <div className="flex gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <div className="flex-1">
                                <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">Unsaved Recording</p>
                                <p className="text-[11px] text-gray-400">{recordingBuffer.length} events — click dots to edit</p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button onClick={discardRecording} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors" title="Discard"><Trash2 className="w-4 h-4" /></button>
                                <button onClick={saveRecording} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs tracking-widest transition-all"><Save className="w-3.5 h-3.5" /> SAVE</button>
                            </div>
                        </div>
                    )}

                    {/* --- Timelines --- */}
                    <div className="space-y-5 pt-3 border-t border-white/5">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <RadioTower className="w-3.5 h-3.5" /> Event Timelines
                            {(savedScript || recordingBuffer.length > 0) && (
                                <span className="ml-auto text-[10px] text-gray-600 normal-case font-normal tracking-normal">Click a dot to edit</span>
                            )}
                        </p>

                        <TimelineVisualizer
                            events={patternScript}
                            duration={duration}
                            currentTime={currentTime}
                            label="Auto AI Pattern"
                            accentColor="#3b82f6"
                        />

                        {isRecording && recordingBuffer.length > 0 && (
                            <TimelineVisualizer
                                events={recordingBuffer}
                                duration={duration}
                                currentTime={currentTime}
                                label="⏺ Recording (unsaved)"
                                accentColor="#ef4444"
                            />
                        )}

                        {!isRecording && recordingBuffer.length > 0 && (
                            <TimelineVisualizer
                                events={recordingBuffer}
                                duration={duration}
                                currentTime={currentTime}
                                label="⏺ Recording (unsaved — click to edit)"
                                accentColor="#ef4444"
                                onUpdate={handleUpdateBufferEvent}
                                onDelete={handleDeleteBufferEvent}
                            />
                        )}

                        {savedScript && (
                            <TimelineVisualizer
                                events={savedScript}
                                duration={duration}
                                currentTime={currentTime}
                                label="Custom Show (saved — click to edit)"
                                accentColor="#a855f7"
                                onUpdate={handleUpdateSavedEvent}
                                onDelete={handleDeleteSavedEvent}
                            />
                        )}

                        {!duration && (
                            <p className="text-xs text-gray-600 italic text-center py-2">Upload a track to see timelines.</p>
                        )}
                    </div>

                    <div className="flex justify-center pt-1">
                        <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                            {mode === 'custom' ? '▶ Playing Custom Show' : '▶ AI Auto-Sync Mode'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioController;
