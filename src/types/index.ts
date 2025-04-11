export interface Page {
    id: string;
    number: number;
    data: Uint8Array;
    thumbnail: string;
    deleted?: boolean;
  }
  
  export interface ExportOptions {
    filename: string;
    quality: string;
  }