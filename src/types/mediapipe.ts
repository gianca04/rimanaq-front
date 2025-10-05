/**
 * Definiciones de tipos para MediaPipe Holistic
 * Evita errores de TypeScript con la librería externa
 */

// Landmark individual
export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

// Resultados de MediaPipe
export interface HolisticResults {
  poseLandmarks?: Landmark[];
  leftHandLandmarks?: Landmark[];
  rightHandLandmarks?: Landmark[];
  faceLandmarks?: Landmark[];
  image?: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement;
  timestamp?: number;
}

// Opciones de configuración
export interface HolisticOptions {
  modelComplexity?: 0 | 1 | 2;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  smoothSegmentation?: boolean;
  refineFaceLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

// Clase Holistic
export interface HolisticInterface {
  setOptions(options: HolisticOptions): void;
  onResults(callback: (results: HolisticResults) => void): void;
  send(inputs: { image: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement }): Promise<void>;
  close?(): void;
}

// Constructor de Holistic
export interface HolisticConstructor {
  new (config: { locateFile: (file: string) => string }): HolisticInterface;
  POSE_CONNECTIONS: Array<[number, number]>;
  HAND_CONNECTIONS: Array<[number, number]>;
  FACEMESH_TESSELATION: Array<[number, number]>;
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
    Holistic: HolisticConstructor;
    Camera: CameraConstructor;
    drawConnectors: DrawConnectorsFunction;
    drawLandmarks: DrawLandmarksFunction;
  }
}

export {};