// Dans src/types/index.ts - Harmonisation des types de rotation

export interface Page {
  id: string;
  number: number;
  data: Uint8Array;
  thumbnail: string;
  deleted?: boolean;
  rotation?: number; // Changé pour accepter n'importe quel nombre de degrés
}
  
export interface ExportOptions {
  filename: string;
  quality: string;
}