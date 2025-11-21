import React from 'react';
import { Sliders, Info, Sparkles } from 'lucide-react';

interface ConfigurationPanelProps {
  temperature: number;
  onTemperatureChange: (val: number) => void;
  systemInstruction: string;
  onSystemInstructionChange: (val: string) => void;
}

interface StylePreset {
    label: string;
    text: string;
    temperature?: number;
}

const STYLE_PRESETS: StylePreset[] = [
  { 
      label: "Uneasy Narrator", 
      text: "The narrator speaks with a steady and natural tone. There is a slight hint of unease beneath their voice, but it does not affect the pacing. They sound like someone who has moved on from the events, yet still remembers the fear. Occasionally, a brief tension appears in their voice, but overall they speak clearly, smoothly, and with control. And it have to be realistic. Sometimes makes spaces. And this voice is talking about himself mostly.",
      temperature: 1.2 
  },
  { label: "Storyteller", text: "You are a captivating storyteller. Speak with a warm, engaging tone, using pauses for dramatic effect." },
  { label: "News Anchor", text: "You are a professional news anchor. Speak clearly, concisely, and with an authoritative, objective tone." },
  { label: "Relaxed", text: "Speak in a very relaxed, slow, and soothing manner, like a meditation guide." },
  { label: "Excited", text: "You are extremely excited and energetic. Speak fast with high enthusiasm and dynamic pitch variations.", temperature: 1.5 },
];

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  temperature,
  onTemperatureChange,
  systemInstruction,
  onSystemInstructionChange,
}) => {
  
  const handlePresetClick = (preset: StylePreset) => {
      onSystemInstructionChange(preset.text);
      if (preset.temperature !== undefined) {
          onTemperatureChange(preset.temperature);
      }
  };

  return (
    <div className="space-y-6 bg-slate-800 p-6 rounded-xl border border-slate-700 h-full">
      <div className="flex items-center gap-2 text-indigo-400 mb-4">
        <Sliders size={20} />
        <h3 className="font-semibold text-lg">Configuration & Style</h3>
      </div>

      {/* Temperature Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            Temperature (Creativity)
            <div className="group relative">
              <Info size={14} className="text-slate-500 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-black rounded text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 text-center z-10">
                Higher values make the speech more expressive and varied.
              </div>
            </div>
          </label>
          <span className="text-indigo-400 font-mono font-bold">{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-500 font-mono">
          <span>0.0 (Stable)</span>
          <span>2.0 (Expressive)</span>
        </div>
      </div>

      {/* System Instructions & Style Presets */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
           <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            Style Instructions
            <span className="text-xs text-slate-500 font-normal">(Define the behavior)</span>
          </label>
          <div className="text-xs text-indigo-300 flex items-center gap-1">
             <Sparkles size={10} /> Style Presets
          </div>
        </div>
        
        {/* Chips */}
        <div className="flex flex-wrap gap-2 mb-2">
            {STYLE_PRESETS.map((preset) => (
                <button
                    key={preset.label}
                    onClick={() => handlePresetClick(preset)}
                    className="px-3 py-1 rounded-full bg-slate-700 hover:bg-indigo-600 hover:text-white text-xs transition-colors border border-slate-600 hover:border-indigo-500"
                    title={preset.temperature ? `Sets temp to ${preset.temperature}` : undefined}
                >
                    {preset.label}
                </button>
            ))}
        </div>

        <textarea
          value={systemInstruction}
          onChange={(e) => onSystemInstructionChange(e.target.value)}
          placeholder="Describe how the model should speak (e.g. 'Speak like a 1920s radio announcer' or 'You are a helpful assistant explaining complex topics simply')."
          className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
        />
      </div>
    </div>
  );
};