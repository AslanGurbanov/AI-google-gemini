export enum VoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr',
  Aoede = 'Aoede',
  Leto = 'Leto',
  Lore = 'Lore',
  Orpheus = 'Orpheus',
  Algenib = 'Algenib',
}

export interface GenerationConfig {
  voice: VoiceName;
  temperature: number;
  systemInstruction: string;
}

export interface GeneratedAudio {
  blobUrl: string;
  duration?: number; // Approximate
}