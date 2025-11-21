import React, { useState } from 'react';
import { AudioWaveform, Wand2, AlertCircle, Trash2 } from 'lucide-react';
import { VoiceName } from './types';
import { generateSpeech } from './services/geminiService';
import { VoiceSelector } from './components/VoiceSelector';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { AudioPlayer } from './components/AudioPlayer';

const MAX_CHARS = 60000;

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [systemInstruction, setSystemInstruction] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    if (text.length > MAX_CHARS) {
        setError(`Text exceeds the ${MAX_CHARS.toLocaleString()} character limit.`);
        return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      const url = await generateSpeech(text, {
        voice,
        temperature,
        systemInstruction
      });
      setAudioUrl(url);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while generating speech.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewRequest = async (voiceName: VoiceName): Promise<string> => {
      // Generate a short sample text
      const sampleText = `Hello, I am ${voiceName}. I can read your text with this voice.`;
      
      return await generateSpeech(sampleText, {
          voice: voiceName,
          temperature: 0.7, // Default balanced temp for preview
          systemInstruction: "Speak clearly and naturally."
      });
  };

  const handleClear = () => {
      setText('');
      setAudioUrl(null);
      setError(null);
  }

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-2 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-3 justify-center mb-2">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
              <AudioWaveform size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Gemini Vox
            </h1>
          </div>
          <p className="text-slate-400 max-w-lg mx-auto">
            Generate ultra-realistic speech using Gemini 2.5 Flash. 
            Select from 9 premium voices with advanced style control.
          </p>
        </header>

        <main className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input Area */}
          <div className="lg:col-span-2 space-y-6">
             {/* Text Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300 pl-1">Input Text</label>
                <button 
                    onClick={handleClear}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                    <Trash2 size={12} /> Clear
                </button>
              </div>
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter your text here to generate speech..."
                  className={`
                    w-full h-96 bg-slate-800 border rounded-xl p-4 text-base leading-relaxed
                    placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none
                    scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent transition-all
                    ${isOverLimit ? 'border-red-500 focus:ring-red-500' : 'border-slate-700'}
                  `}
                  disabled={isGenerating}
                />
                <div className={`absolute bottom-4 right-4 text-xs font-mono px-2 py-1 rounded bg-slate-900/80 backdrop-blur-sm ${isOverLimit ? 'text-red-400' : 'text-slate-500'}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </div>
              </div>
              {isOverLimit && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                      <AlertCircle size={14} />
                      Character limit exceeded.
                  </p>
              )}
            </div>

             {/* Mobile/Tablet Layout: Config might appear below text on smaller screens */}
             <div className="lg:hidden">
                <ConfigurationPanel 
                    temperature={temperature} 
                    onTemperatureChange={setTemperature}
                    systemInstruction={systemInstruction}
                    onSystemInstructionChange={setSystemInstruction}
                />
             </div>
          </div>

          {/* Right Column: Controls & Output */}
          <div className="space-y-6">
            
            {/* Controls */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300">Select Voice</label>
                    <VoiceSelector 
                        selectedVoice={voice} 
                        onSelectVoice={setVoice} 
                        onPreviewRequest={handlePreviewRequest}
                    />
                </div>

                <div className="hidden lg:block">
                    <ConfigurationPanel 
                        temperature={temperature} 
                        onTemperatureChange={setTemperature}
                        systemInstruction={systemInstruction}
                        onSystemInstructionChange={setSystemInstruction}
                    />
                </div>

                {/* Generate Button */}
                <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim() || isOverLimit}
                className={`
                    w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all transform active:scale-[0.98]
                    ${isGenerating 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : (!text.trim() || isOverLimit)
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25'
                    }
                `}
                >
                {isGenerating ? (
                    <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating Audio...</span>
                    </>
                ) : (
                    <>
                    <Wand2 size={20} />
                    <span>Generate Speech</span>
                    </>
                )}
                </button>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
            </div>

            {/* Output Area */}
            {audioUrl && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="mb-2 flex items-center gap-2 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_currentColor]"></span>
                        <span className="text-sm font-medium">Generation Complete</span>
                     </div>
                    <AudioPlayer src={audioUrl} autoPlay />
                </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default App;