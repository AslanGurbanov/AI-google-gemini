import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationConfig } from "../types";
import { base64ToUint8Array, pcmToWav } from "./audioUtils";

const MODEL_NAME = "gemini-2.5-flash-preview-tts";
// Safe chunk size to stay well under the 8192 token limit (approx 32k chars).
// We use 4000 chars to be safe and allow for system instruction overhead.
const MAX_CHUNK_LENGTH = 4000; 

export const generateSpeech = async (
  text: string,
  config: GenerationConfig
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  const audioSegments: Uint8Array[] = [];

  // Chunk text to avoid token limits
  const chunks = chunkString(text, MAX_CHUNK_LENGTH);

  // Process chunks sequentially to maintain order and avoid rate limits
  for (const chunk of chunks) {
      // For TTS, system instructions are often better handled as part of the prompt
      // to avoid potential 500 errors with the specific preview model configuration.
      // We prepend it to each chunk to maintain style/voice persona across the entire reading.
      const finalPrompt = config.systemInstruction 
        ? `${config.systemInstruction}\n\n${chunk}`
        : chunk;

      try {
        const response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [
            {
              parts: [
                {
                  text: finalPrompt,
                },
              ],
            },
          ],
          config: {
            responseModalities: [Modality.AUDIO],
            temperature: config.temperature,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: config.voice,
                },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
            const pcmData = base64ToUint8Array(base64Audio);
            audioSegments.push(pcmData);
        } else {
            console.warn("Chunk returned no audio data");
        }
      } catch (error: any) {
        console.error("Error generating speech chunk:", error);
        if (error.message?.includes("500")) {
           throw new Error("The AI service encountered an internal error. Please try again.");
        }
        if (error.message?.includes("400")) {
           throw new Error(`Invalid request: ${error.message}. Try reducing the text length or complexity.`);
        }
        throw error;
      }
  }

  if (audioSegments.length === 0) {
     throw new Error("No audio generated.");
  }

  // Calculate total buffer size
  const totalLength = audioSegments.reduce((acc, curr) => acc + curr.length, 0);
  const combinedPcm = new Uint8Array(totalLength);
  
  // Concatenate segments
  let offset = 0;
  for (const seg of audioSegments) {
      combinedPcm.set(seg, offset);
      offset += seg.length;
  }

  // Gemini TTS output is typically 24kHz. Convert combined PCM to WAV.
  const wavBlob = pcmToWav(combinedPcm, 24000); 
  
  return URL.createObjectURL(wavBlob);
};

/**
 * Helper function to intelligently split text into chunks closer to `size`
 * while respecting sentence and paragraph boundaries.
 */
const chunkString = (str: string, size: number): string[] => {
    if (str.length <= size) return [str];

    const chunks: string[] = [];
    let index = 0;

    while (index < str.length) {
        let chunkEnd = index + size;
        
        // If the remaining text fits, just add it
        if (chunkEnd >= str.length) {
            chunks.push(str.slice(index));
            break;
        }

        // Look for a natural break point backwards from the limit
        let splitIndex = -1;
        const searchWindow = str.slice(index, chunkEnd);
        
        // 1. Try Paragraphs (Double newline)
        // We prioritize this to avoid breaking flow
        const lastDoubleNewline = searchWindow.lastIndexOf('\n\n');
        if (lastDoubleNewline !== -1 && lastDoubleNewline > size * 0.5) {
             splitIndex = index + lastDoubleNewline + 2; 
        } 
        // 2. Try Sentence endings (. ! ?)
        else {
            const lastPeriod = searchWindow.lastIndexOf('. ');
            const lastQuestion = searchWindow.lastIndexOf('? ');
            const lastExclaim = searchWindow.lastIndexOf('! ');
            const bestPunc = Math.max(lastPeriod, lastQuestion, lastExclaim);
            
            if (bestPunc !== -1 && bestPunc > size * 0.5) {
                splitIndex = index + bestPunc + 2; 
            }
            // 3. Fallback to Space
            else {
                 const lastSpace = searchWindow.lastIndexOf(' ');
                 if (lastSpace !== -1) {
                     splitIndex = index + lastSpace + 1;
                 }
            }
        }

        // If absolutely no split point found (e.g. giant string of characters), force split
        if (splitIndex === -1) {
            splitIndex = chunkEnd;
        }

        chunks.push(str.slice(index, splitIndex));
        index = splitIndex;
    }
    return chunks;
}