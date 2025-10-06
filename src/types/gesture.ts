/**
 * Tipos TypeScript para el sistema de práctica de gestos
 * Basado en el formato JSON de gestos secuenciales
 */

export interface Landmark {
  x: number;
  y: number;
  z?: number; // Opcional para compatibilidad con MediaPipe
}

export interface Handedness {
  index: number;
  score: number;
  label: 'Left' | 'Right';
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface HandSize {
  length: number;
  width: number;
  area: number;
}

export interface Centroide {
  x: number;
  y: number;
}

export interface SequenceMetadata {
  captureQuality: number;
  centroide: Centroide;
  boundingBox: BoundingBox;
  handSize: HandSize;
}

export interface GestureFrame {
  id: number;
  timestamp: string;
  landmarks: Landmark[][];
  landmarksNormalizados: Landmark[];
  handedness: Handedness[];
  gestureName: string;
  frameIndex: number;
  sequenceMetadata: SequenceMetadata;
}

export interface GestureData {
  name: string;
  frames: GestureFrame[];
  frameCount: number;
  isSequential: boolean;
  createdAt: string;
}

export interface GestureFile {
  version: string;
  createdAt: string;
  gesture: GestureData;
}

export interface PracticeSession {
  gesture: GestureData;
  currentFrameIndex: number;
  isActive: boolean;
  startedAt: Date;
  completedFrames: number[];
  similarityThreshold: number;
}

export interface PracticeResult {
  frameIndex: number;
  similarity: number;
  passed: boolean;
  timestamp: Date;
}