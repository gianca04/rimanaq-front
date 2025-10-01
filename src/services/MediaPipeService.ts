/**
 * MediaPipe Service - Singleton para manejar la instancia WASM
 * Evita re-inicializaciones y problemas de reactividad de React
 */

interface MediaPipeResults {
  timestamp: number;
  poseLandmarks: any[] | null;
  leftHandLandmarks: any[] | null;
  rightHandLandmarks: any[] | null;
  faceLandmarks: any[] | null;
}

type OnResultsCallback = (results: MediaPipeResults) => void;

class MediaPipeService {
  private static instance: MediaPipeService | null = null;
  private holistic: any = null;
  private camera: any = null;
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
    return !!(window as any).Holistic && !!(window as any).Camera && !!(window as any).drawConnectors;
  }

  /**
   * Inicializa MediaPipe Holistic una sola vez
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

      // Crear instancia Holistic SOLO UNA VEZ
      this.holistic = new (window as any).Holistic({
        locateFile: (file: string) => 
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5/${file}`
      });

      // Configurar opciones
      this.holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        refineFaceLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Configurar callback interno
      this.holistic.onResults((results: any) => {
        const formattedResults: MediaPipeResults = {
          timestamp: Date.now(),
          poseLandmarks: results.poseLandmarks || null,
          leftHandLandmarks: results.leftHandLandmarks || null,
          rightHandLandmarks: results.rightHandLandmarks || null,
          faceLandmarks: results.faceLandmarks || null,
        };

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
   * Inicia la cámara y conecta con Holistic
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

      this.camera = new (window as any).Camera(videoElement, {
        onFrame: async () => {
          if (this.holistic && this.videoElement) {
            await this.holistic.send({ image: this.videoElement });
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

    const drawConnectors = (window as any).drawConnectors;
    const drawLandmarks = (window as any).drawLandmarks;
    const Holistic = (window as any).Holistic;

    if (drawConnectors && drawLandmarks && Holistic) {
      // Pose (cuerpo) - Azul
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, Holistic.POSE_CONNECTIONS, 
          { color: '#1E90FF', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
      }

      // Cara - Cián
      if (results.faceLandmarks) {
        drawConnectors(canvasCtx, results.faceLandmarks, Holistic.FACEMESH_TESSELATION,
          { color: '#00FFFF', lineWidth: 1 });
        drawLandmarks(canvasCtx, results.faceLandmarks, 
          { color: '#00FFFF', lineWidth: 1, radius: 1 });
      }

      // Manos - Azul para ambas
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, Holistic.HAND_CONNECTIONS,
          { color: '#1E90FF', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
      }

      if (results.rightHandLandmarks) {
        drawConnectors(canvasCtx, results.rightHandLandmarks, Holistic.HAND_CONNECTIONS,
          { color: '#1E90FF', lineWidth: 2 });
        drawLandmarks(canvasCtx, results.rightHandLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
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

    if (this.holistic) {
      try {
        if (this.holistic.close) {
          this.holistic.close();
        }
        this.holistic = null;
        console.log('✅ MediaPipeService: Holistic cerrado');
      } catch (error) {
        console.error('❌ MediaPipeService: Error al cerrar Holistic:', error);
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