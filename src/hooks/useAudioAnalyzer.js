import { useState, useEffect, useRef, useCallback } from 'react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#eab308', '#06b6d4', '#ec4899', '#ffffff'];

export const useAudioAnalyzer = (audioRef, onPatternEvent, customScript = null, useCustomScript = false) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [patternScript, setPatternScript] = useState([]);
    const [audioEnergy, setAudioEnergy] = useState(0);
    const [duration, setDuration] = useState(0);

    const patternIndexRef = useRef(0);
    const animationFrameRef = useRef(null);

    const [audioContext, setAudioContext] = useState(null);
    const [analyser, setAnalyser] = useState(null);
    const [dataArray, setDataArray] = useState(null);

    const initRealtimeAudio = useCallback(() => {
        if (audioContext || !audioRef.current) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const analyserNode = ctx.createAnalyser();
            analyserNode.fftSize = 512;
            const dataArr = new Uint8Array(analyserNode.frequencyBinCount);

            const source = ctx.createMediaElementSource(audioRef.current);
            source.connect(analyserNode);
            analyserNode.connect(ctx.destination);

            setAudioContext(ctx);
            setAnalyser(analyserNode);
            setDataArray(dataArr);
        } catch (err) {
            console.error("Realtime audio context init failed:", err);
        }
    }, [audioContext, audioRef]);

    const analyzeFullSong = async (file) => {
        setIsAnalyzing(true);
        setPatternScript([]);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioContext();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

            setDuration(audioBuffer.duration);

            const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
            const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);

            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;

            const biquadFilter = offlineCtx.createBiquadFilter();
            biquadFilter.type = 'lowpass';
            biquadFilter.frequency.value = 150;

            source.connect(biquadFilter);
            biquadFilter.connect(offlineCtx.destination);
            source.start(0);

            const renderedBuffer = await offlineCtx.startRendering();
            const channelData = renderedBuffer.getChannelData(0);
            const sampleRate = renderedBuffer.sampleRate;

            const windowSize = Math.floor(sampleRate * 0.05);
            const energies = [];

            for (let i = 0; i < channelData.length; i += windowSize) {
                let sum = 0;
                const end = Math.min(i + windowSize, channelData.length);
                for (let j = i; j < end; j++) {
                    sum += channelData[j] * channelData[j];
                }
                energies.push({
                    time: i / sampleRate,
                    energy: Math.sqrt(sum / (end - i)) * 100
                });
            }

            const windowFrames = 20;
            for (let i = 0; i < energies.length; i++) {
                let start = Math.max(0, i - Math.floor(windowFrames / 2));
                let end = Math.min(energies.length, i + Math.floor(windowFrames / 2));
                let localSum = 0;
                for (let j = start; j < end; j++) {
                    localSum += energies[j].energy;
                }
                energies[i].localAvg = localSum / (end - start);
            }

            const script = [];
            let colorIndex = 0;
            const COOLDOWN_FRAMES = 4;

            for (let i = 1; i < energies.length - 1; i++) {
                const current = energies[i];
                const prev = energies[i - 1];
                const next = energies[i + 1];

                if (current.energy > prev.energy &&
                    current.energy > next.energy &&
                    current.energy > current.localAvg * 1.6 &&
                    current.energy > 0.5
                ) {

                    let effect = 'none';
                    if (current.energy > current.localAvg * 2.5) {
                        effect = 'strobe';
                    } else if (current.energy > current.localAvg * 1.8) {
                        effect = 'pulse';
                    }

                    script.push({
                        time: current.time,
                        color: COLORS[colorIndex % COLORS.length],
                        effect: effect,
                        energy: current.energy
                    });

                    colorIndex++;
                    i += COOLDOWN_FRAMES;
                }
            }

            setPatternScript(script);

        } catch (error) {
            console.error("Audio analysis failed:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const playbackLoop = useCallback(() => {
        if (!isPlaying || !audioRef.current) return;

        const currentTime = audioRef.current.currentTime;
        const activeScript = useCustomScript && customScript ? customScript : patternScript;

        // VU meter visualizer update
        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < 30; i++) sum += dataArray[i];
            setAudioEnergy((sum / 30) / 255);
        }

        if (activeScript.length > 0) {
            let nextEventIndex = patternIndexRef.current;

            while (
                nextEventIndex < activeScript.length &&
                currentTime >= activeScript[nextEventIndex].time
            ) {
                if (nextEventIndex === patternIndexRef.current || (currentTime - activeScript[nextEventIndex].time) < 0.1) {
                    onPatternEvent(activeScript[nextEventIndex]);
                }
                nextEventIndex++;
            }

            patternIndexRef.current = nextEventIndex;
        }

        animationFrameRef.current = requestAnimationFrame(playbackLoop);
    }, [isPlaying, patternScript, customScript, useCustomScript, onPatternEvent, analyser, dataArray]);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        const handleLoadedMetadata = () => {
            if (audioEl.duration) {
                setDuration(audioEl.duration);
            }
        };

        const handlePlay = () => {
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
            setIsPlaying(true);
        };

        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => {
            setIsPlaying(false);
            patternIndexRef.current = 0;
        };
        const handleSeeked = () => {
            const activeScript = useCustomScript && customScript ? customScript : patternScript;
            if (activeScript.length > 0 && audioEl) {
                const current = audioEl.currentTime;
                let newIndex = 0;
                while (newIndex < activeScript.length && activeScript[newIndex].time < current) {
                    newIndex++;
                }
                patternIndexRef.current = newIndex;
            }
        };

        audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);
        audioEl.addEventListener('ended', handleEnded);
        audioEl.addEventListener('seeked', handleSeeked);

        return () => {
            audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
            audioEl.removeEventListener('ended', handleEnded);
            audioEl.removeEventListener('seeked', handleSeeked);
        };
    }, [audioRef, audioContext, patternScript, customScript, useCustomScript]);

    useEffect(() => {
        if (isPlaying) {
            playbackLoop();
        } else if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, playbackLoop]);

    return { initRealtimeAudio, analyzeFullSong, isAnalyzing, patternScript, audioEnergy, isPlaying, duration };
};
