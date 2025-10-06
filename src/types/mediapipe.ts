/**
 * Definiciones de tipos para MediaPipe Hands
 * Evita errores de TypeScript con la librería externa
 */

// Landmark individual
export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

// Resultados de MediaPipe Hands
export interface HandsResults {
  multiHandLandmarks?: Landmark[][];
  multiHandedness?: Array<{
    index: number;
    score: number;
    label: string;
  }>;
  image?: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;
  timestamp?: number;
}

// Opciones de configuración para Hands
export interface HandsOptions {
  modelComplexity?: 0 | 1;
  maxNumHands?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// Clase Hands
export interface HandsInterface {
  setOptions(options: HandsOptions): void;
  onResults(callback: (results: HandsResults) => void): void;
  send(inputs: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
  close?(): void;
}

// Constructor de Hands
export interface HandsConstructor {
  new (config: { locateFile: (file: string) => string }): HandsInterface;
  HAND_CONNECTIONS: Array<[number, number]>;
}

// Opciones de cámara
export interface CameraOptions {
  onFrame: () => Promise<void> | void;
  width: number;
  height: number;
}

// Interfaz de cámara
export interface CameraInterface {
  start(): Promise<void>;
  stop(): void;
}

// Constructor de cámara
export interface CameraConstructor {
  new (videoElement: HTMLVideoElement, options: CameraOptions): CameraInterface;
}

// Opciones de dibujo
export interface DrawingOptions {
  color?: string;
  lineWidth?: number;
  radius?: number;
}

// Funciones de dibujo
export type DrawConnectorsFunction = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  connections: Array<[number, number]>,
  style?: DrawingOptions
) => void;

export type DrawLandmarksFunction = (
  ctx: CanvasRenderingContext2D,
  landmarks: Landmark[],
  style?: DrawingOptions
) => void;

// Extensión del objeto Window para MediaPipe
declare global {
  interface Window {
    Hands: HandsConstructor;
    Camera: CameraConstructor;
    drawConnectors: DrawConnectorsFunction;
    drawLandmarks: DrawLandmarksFunction;
  }
}

export {};