import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Download, AlertCircle } from 'lucide-react';

interface TrackingTestProps {
  onBack: () => void;
}

// Tipos para MediaPipe
interface TrackingResults {
  timestamp: number;
  poseLandmarks: any[] | null;
  leftHandLandmarks: any[] | null;
  rightHandLandmarks: any[] | null;
  faceLandmarks: any[] | null;
}

const TrackingTest: React.FC<TrackingTestProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const holisticRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<TrackingResults | null>(null);

  // Función para exportar los datos de tracking
  const exportTrackingData = (results: TrackingResults) => {
    const data = {
      timestamp: Date.now(),
      poseLandmarks: results.poseLandmarks || [],
      leftHandLandmarks: results.leftHandLandmarks || [],
      rightHandLandmarks: results.rightHandLandmarks || [],
      faceLandmarks: results.faceLandmarks || []
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lsp_tracking_${data.timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Función que maneja los resultados de MediaPipe
  const onResults = (results: any) => {
    if (!canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext('2d');
    if (!canvasCtx) return;

    // Ocultar loading al recibir primer resultado
    if (isLoading) {
      setIsLoading(false);
    }

    // Limpiar canvas
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Dibujar video de fondo
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Dibujar landmarks usando MediaPipe drawing utils
    if (window.drawConnectors && window.drawLandmarks) {
      // Pose (cuerpo) - Azul
      if (results.poseLandmarks) {
        window.drawConnectors(canvasCtx, results.poseLandmarks, window.Holistic.POSE_CONNECTIONS, 
          { color: '#1E90FF', lineWidth: 4 });
        window.drawLandmarks(canvasCtx, results.poseLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
      }

      // Cara - Cián
      if (results.faceLandmarks) {
        window.drawConnectors(canvasCtx, results.faceLandmarks, window.Holistic.FACEMESH_TESSELATION,
          { color: '#00FFFF', lineWidth: 1 });
        window.drawLandmarks(canvasCtx, results.faceLandmarks, 
          { color: '#00FFFF', lineWidth: 1, radius: 1 });
      }

      // Manos - Azul para ambas
      if (results.leftHandLandmarks) {
        window.drawConnectors(canvasCtx, results.leftHandLandmarks, window.Holistic.HAND_CONNECTIONS,
          { color: '#1E90FF', lineWidth: 2 });
        window.drawLandmarks(canvasCtx, results.leftHandLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
      }

      if (results.rightHandLandmarks) {
        window.drawConnectors(canvasCtx, results.rightHandLandmarks, window.Holistic.HAND_CONNECTIONS,
          { color: '#1E90FF', lineWidth: 2 });
        window.drawLandmarks(canvasCtx, results.rightHandLandmarks, 
          { color: '#1E90FF', lineWidth: 2, radius: 2 });
      }
    }

    canvasCtx.restore();

    // Guardar últimos resultados para exportar
    setLastResults({
      timestamp: Date.now(),
      poseLandmarks: results.poseLandmarks || null,
      leftHandLandmarks: results.leftHandLandmarks || null,
      rightHandLandmarks: results.rightHandLandmarks || null,
      faceLandmarks: results.faceLandmarks || null,
    });
  };

  // Inicializar MediaPipe cuando el componente se monta
  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        // Verificar si MediaPipe está disponible
        if (!window.Holistic) {
          throw new Error('MediaPipe no está cargado. Asegúrate de que los scripts estén incluidos.');
        }

        console.log('🚀 Inicializando MediaPipe Holistic...');
        
        // Crear instancia de Holistic
        const holistic = new window.Holistic({
          locateFile: (file: string) => 
            `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@0.5/${file}`
        });

        // Configurar opciones
        holistic.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          smoothSegmentation: false,
          refineFaceLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        holistic.onResults(onResults);
        holisticRef.current = holistic;

        // Inicializar cámara
        if (videoRef.current && window.Camera) {
          const camera = new window.Camera(videoRef.current, {
            onFrame: async () => {
              if (videoRef.current && holisticRef.current) {
                await holisticRef.current.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480
          });

          await camera.start();
          cameraRef.current = camera;
          setIsInitialized(true);
          console.log('✅ MediaPipe iniciado correctamente');
        }
      } catch (err) {
        console.error('❌ Error al inicializar MediaPipe:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsLoading(false);
      }
    };

    initMediaPipe();

    // Cleanup al desmontar
    return () => {
      if (cameraRef.current && cameraRef.current.stop) {
        cameraRef.current.stop();
      }
      if (holisticRef.current && holisticRef.current.close) {
        holisticRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver</span>
            </button>
            <h1 className="text-3xl font-bold text-white">
              📹 Prueba de Tracking LSP
            </h1>
            <div className="flex space-x-2">
              {lastResults && (
                <button
                  onClick={() => exportTrackingData(lastResults)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              
              {/* Estado de carga */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando modelo MediaPipe...</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center justify-center py-12">
                  <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Error al inicializar tracking</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Video y Canvas */}
              {!isLoading && !error && (
                <div className="space-y-6">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-auto"
                      style={{ display: 'none' }}
                      playsInline
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className="w-full h-auto"
                    />
                    
                    {/* Overlay con información */}
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm">
                          {isInitialized ? '🟢 Tracking activo' : '🔴 Inicializando...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      📊 Información del Tracking
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Pose:</span>
                        <span className="ml-2 font-mono">
                          {lastResults?.poseLandmarks ? '✅' : '❌'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cara:</span>
                        <span className="ml-2 font-mono">
                          {lastResults?.faceLandmarks ? '✅' : '❌'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mano Izq:</span>
                        <span className="ml-2 font-mono">
                          {lastResults?.leftHandLandmarks ? '✅' : '❌'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mano Der:</span>
                        <span className="ml-2 font-mono">
                          {lastResults?.rightHandLandmarks ? '✅' : '❌'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      💡 Instrucciones
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Permite el acceso a la cámara cuando te lo solicite</li>
                      <li>• Colócate frente a la cámara con buena iluminación</li>
                      <li>• Realiza gestos de lengua de señas para probar el tracking</li>
                      <li>• Haz clic en "Exportar" para descargar los datos de tracking</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingTest;