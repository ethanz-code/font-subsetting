export interface FontMetadata {
  fileName: string;
  fontName: string;
  familyName: string;
  styleName: string;
  unitsPerEm: number;
  glyphCount: number;
  buffer: ArrayBuffer;
  originalSize: number;
}

export interface ProcessedResult {
  zipBlob: Blob;
  cssSnippet: string;
  subsetSize: number;
  savings: number;
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  EDITOR = 'EDITOR',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export type Language = 'zh' | 'en';

// Declaration for global window libraries loaded via CDN
declare global {
  interface Window {
    opentype: any;
    JSZip: any;
  }
}