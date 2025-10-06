/**
 * MediaPipe Service - Singleton para manejar la instancia WASM
 * Evita re-inicializaciones y problemas de reactividad de React
 * Actualizado para usar las librerías específicas de MediaPipe Hands
 */

import type { 
  Landmark,
  HandsInterface,
  CameraInterface,
  HandsResults
} from '../types/mediapipe';

interface MediaPipeResults {
  timestamp: number;
  poseLandmarks: Landmark[] | null;
  leftHandLandmarks: Landmark[] | null;
  rightHandLandmarks: Landmark[] | null;
  faceLandmarks: Landmark[] | null;
}

type OnResultsCallback = (results: MediaPipeResults) => void;

class MediaPipeService {
  private static instance: MediaPipeService | null = null;
  private hands: HandsInterface | null = null;
  private camera: CameraInterface | null = null;
  private isInitialized: boolean = false;
  private isInitializing: boolean = false;
  private onResultsCallback: OnResultsCallback | null = null;
  private videoElement: HTMLVideoElement | null = null;

  /**
   * Singleton pattern - una sola instancia en toda la aplicación
   */
  static getInstance(): MediaPipeService {
    if (!MediaPipeService.instance) {
      MediaPipeService.instance = new MediaPipeService();
    }
    return MediaPipeService.instance;
  }

  /**
   * Constructor privado para singleton
   */
  private constructor() {
    console.log('🏗️ MediaPipeService: Instancia creada');
  }

  /**
   * Verifica si MediaPipe está disponible en el window global
   */
  private checkMediaPipeAvailability(): boolean {
    return !!window.Hands && !!window.Camera && !!window.drawConnectors;
  }

  /**
   * Inicializa MediaPipe Hands una sola vez
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('✅ MediaPipeService: Ya inicializado, reutilizando instancia');
      return true;
    }

    if (this.isInitializing) {
      console.log('⏳ MediaPipeService: Inicialización en progreso...');
      return false;
    }

    this.isInitializing = true;

    try {
      console.log('🚀 MediaPipeService: Iniciando inicialización...');

      // Verificar disponibilidad
      if (!this.checkMediaPipeAvailability()) {
        throw new Error('MediaPipe no está disponible. Verifica que los scripts estén cargados.');
      }

      // Crear instancia Hands SOLO UNA VEZ
      this.hands = new window.Hands({
        locateFile: (file: string) => 
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      // Configurar opciones para detección de manos
      this.hands.setOptions({
        modelComplexity: 1,
        maxNumHands: 2,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Configurar callback interno
      this.hands.onResults((results: HandsResults) => {
        const formattedResults: MediaPipeResults = {
          timestamp: Date.now(),
          poseLandmarks: null, // Hands no detecta pose
          leftHandLandmarks: null,
          rightHandLandmarks: null,
          faceLandmarks: null, // Hands no detecta cara
        };

        // Procesar las manos detectadas
        if (results.multiHandLandmarks && results.multiHandedness) {
          for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const handedness = results.multiHandedness[i];
            const landmarks = results.multiHandLandmarks[i];
            
            if (handedness.label === 'Left') {
              formattedResults.leftHandLandmarks = landmarks;
            } else if (handedness.label === 'Right') {
              formattedResults.rightHandLandmarks = landmarks;
            }
          }
        }

        // Llamar callback del componente si existe
        if (this.onResultsCallback) {
          this.onResultsCallback(formattedResults);
        }
      });

      this.isInitialized = true;
      this.isInitializing = false;
      console.log('✅ MediaPipeService: Inicialización completada');
      return true;

    } catch (error) {
      console.error('❌ MediaPipeService: Error en inicialización:', error);
      this.isInitializing = false;
      throw error;
    }
  }

  /**
   * Inicia la cámara y conecta con Hands
   */
  async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('MediaPipe no está inicializado. Llama a initialize() primero.');
    }

    if (this.camera) {
      console.log('🎥 MediaPipeService: Cámara ya iniciada, reutilizando...');
      return;
    }

    try {
      console.log('🎥 MediaPipeService: Iniciando cámara...');
      this.videoElement = videoElement;

      this.camera = new window.Camera(videoElement, {
        onFrame: async () => {
          if (this.hands && this.videoElement) {
            await this.hands.send({ image: this.videoElement });
          }
        },
        width: 640,
        height: 480
      });

      await this.camera.start();
      console.log('✅ MediaPipeService: Cámara iniciada correctamente');

    } catch (error) {
      console.error('❌ MediaPipeService: Error al iniciar cámara:', error);
      throw error;
    }
  }

  /**
   * Detiene la cámara
   */
  stopCamera(): void {
    if (this.camera) {
      console.log('🛑 MediaPipeService: Deteniendo cámara...');
      try {
        this.camera.stop();
        this.camera = null;
        this.videoElement = null;
        console.log('✅ MediaPipeService: Cámara detenida');
      } catch (error) {
        console.error('❌ MediaPipeService: Error al detener cámara:', error);
      }
    }
  }

  /**
   * Establece el callback para recibir resultados
   */
  setOnResultsCallback(callback: OnResultsCallback | null): void {
    this.onResultsCallback = callback;
    console.log('📡 MediaPipeService: Callback configurado');
  }

  /**
   * Dibuja los landmarks en el canvas
   */
  drawResults(canvasElement: HTMLCanvasElement, results: MediaPipeResults, videoElement: HTMLVideoElement): void {
    const canvasCtx = canvasElement.getContext('2d');
    if (!canvasCtx) return;

    // Limpiar canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Dibujar video de fondo
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    const drawConnectors = window.drawConnectors;
    const drawLandmarks = window.drawLandmarks;
    const Hands = window.Hands;

    if (drawConnectors && drawLandmarks && Hands) {
      // Mano izquierda - Verde
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, Hands.HAND_CONNECTIONS,
          { color: '#00FF00', lineWidth: 3 });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, 
          { color: '#00FF00', lineWidth: 2, radius: 3 });
      }

      // Mano derecha - Azul
      if (results.rightHandLandmarks) {
        drawConnectors(canvasCtx, results.rightHandLandmarks, Hands.HAND_CONNECTIONS,
          { color: '#1E90FF', lineWidth: 3 });
        drawLandmarks(canvasCtx, results.rightHandLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 3 });
      }
    }

    canvasCtx.restore();
  }

  /**
   * Obtiene el estado actual del servicio
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.isInitializing,
      isCameraActive: !!this.camera,
      hasCallback: !!this.onResultsCallback
    };
  }

  /**
   * Cleanup completo - solo llamar al salir de la aplicación
   */
  destroy(): void {
    console.log('🗑️ MediaPipeService: Iniciando cleanup...');
    
    this.stopCamera();
    this.setOnResultsCallback(null);

    if (this.hands) {
      try {
        if (this.hands.close) {
          this.hands.close();
        }
        this.hands = null;
        console.log('✅ MediaPipeService: Hands cerrado');
      } catch (error) {
        console.error('❌ MediaPipeService: Error al cerrar Hands:', error);
      }
    }

    this.isInitialized = false;
    console.log('✅ MediaPipeService: Cleanup completado');
  }

  /**
   * Reset para debugging - NO usar en producción
   */
  reset(): void {
    console.warn('⚠️ MediaPipeService: Reset forzado (solo para debugging)');
    this.destroy();
    MediaPipeService.instance = null;
  }
}

// Exportar instancia singleton
export const mediaPipeService = MediaPipeService.getInstance();
export type { MediaPipeResults };