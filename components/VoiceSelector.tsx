import React, { useState, useRef, useEffect } from 'react';
import { VoiceName } from '../types';
import { Mic2, Play, Square, Loader2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelectVoice: (voice: VoiceName) => void;
  onPreviewRequest: (voice: VoiceName) => Promise<string>;
}

const voices = [
  { name: VoiceName.Puck, gender: 'Male', desc: 'Playful & Energetic' },
  { name: VoiceName.Charon, gender: 'Male', desc: 'Deep & Authoritative' },
  { name: VoiceName.Kore, gender: 'Female', desc: 'Calm & Soothing' },
  { name: VoiceName.Fenrir, gender: 'Male', desc: 'Intense & Gritty' },
  { name: VoiceName.Zephyr, gender: 'Female', desc: 'Soft & Gentle' },
  { name: VoiceName.Aoede, gender: 'Female', desc: 'Classy & Mature' },
  { name: VoiceName.Leto, gender: 'Female', desc: 'Direct & Confident' },
  { name: VoiceName.Lore, gender: 'Male', desc: 'Warm Storyteller' },
  { name: VoiceName.Orpheus, gender: 'Male', desc: 'Confident & Energetic' },
  { name: VoiceName.Algenib, gender: 'Male', desc: 'Steady & Uneasy' },
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onSelectVoice, onPreviewRequest }) => {
  const [playingVoice, setPlayingVoice] = useState<VoiceName | null>(null);
  const [loadingVoice, setLoadingVoice] = useState<VoiceName | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePreview = async (e: React.MouseEvent, voice: VoiceName) => {
    e.stopPropagation(); // Prevent selecting the voice when clicking preview

    // If clicking the same voice that is playing, stop it.
    if (playingVoice === voice) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingVoice(null);
      return;
    }

    // Stop any currently playing voice
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayingVoice(null);
    }

    try {
      setLoadingVoice(voice);
      const url = await onPreviewRequest(voice);
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onended = () => {
        setPlayingVoice(null);
      };

      audio.onplay = () => {
        setLoadingVoice(null);
        setPlayingVoice(voice);
      };

      // Handle potential play errors (e.g. browser blocking auto-play)
      await audio.play().catch(err => {
         console.error("Playback failed", err);
         setPlayingVoice(null);
      });
      
    } catch (err) {
      console.error("Failed to preview voice:", err);
      setLoadingVoice(null);
      setPlayingVoice(null);
      // Optional: Alert user or show toast
    } finally {
       // Ensure loading state is cleared if we errored out before play
       if (!audioRef.current || audioRef.current.paused) {
           setLoadingVoice(null);
       }
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
      {voices.map((voice) => (
        <div
          key={voice.name}
          onClick={() => onSelectVoice(voice.name)}
          className={`
            group relative flex flex-col items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none
            ${
              selectedVoice === voice.name
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                : 'border-slate-700 bg-slate-800 hover:border-indigo-400/50 hover:bg-slate-750'
            }
          `}
        >
          <div className="flex flex-col items-center w-full">
            <div className={`
              p-2 rounded-full mb-2 transition-colors
              ${selectedVoice === voice.name ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'}
            `}>
              <Mic2 size={20} />
            </div>
            <span className="font-semibold text-sm">{voice.name}</span>
            <span className="text-xs text-slate-400 mt-1">{voice.gender}</span>
            <span className="text-[10px] text-slate-500 mt-1 text-center line-clamp-1">{voice.desc}</span>
          </div>

          {/* Preview Button */}
          <button
            onClick={(e) => handlePreview(e, voice.name)}
            disabled={loadingVoice === voice.name}
            className={`
              mt-3 w-full py-1.5 px-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium transition-all z-10
              ${
                playingVoice === voice.name
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-slate-700/50 text-indigo-300 hover:bg-indigo-500 hover:text-white'
              }
            `}
          >
            {loadingVoice === voice.name ? (
              <Loader2 size={12} className="animate-spin" />
            ) : playingVoice === voice.name ? (
              <>
                <Square size={10} fill="currentColor" /> Stop
              </>
            ) : (
              <>
                <Play size={10} fill="currentColor" /> Preview
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
};