import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Download, AlertCircle, Activity } from 'lucide-react';
import { mediaPipeService, type MediaPipeResults } from '../services/MediaPipeService';

interface TrackingTestProps {
  onBack: () => void;
}

const TrackingTest: React.FC<TrackingTestProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<MediaPipeResults | null>(null);
  const [serviceStatus, setServiceStatus] = useState(mediaPipeService.getStatus());

  // Función para exportar los datos de tracking
  const exportTrackingData = (results: MediaPipeResults) => {
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

  // Callback para manejar resultados del tracking
  const handleResults = (results: MediaPipeResults) => {
    setLastResults(results);
    
    if (!canvasRef.current || !videoRef.current) return;
    
    // Usar el método de dibujo del servicio singleton
    mediaPipeService.drawResults(canvasRef.current, results, videoRef.current);
  };



  // Inicializar tracking con servicio singleton
  const startTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!videoRef.current || !canvasRef.current) {
        throw new Error('Referencias de video o canvas no disponibles');
      }

      console.log('🚀 Iniciando tracking con MediaPipeService...');

      // Inicializar servicio singleton (solo la primera vez)
      const initialized = await mediaPipeService.initialize();
      if (!initialized) {
        throw new Error('No se pudo inicializar MediaPipe');
      }

      // Configurar callback de resultados
      mediaPipeService.setOnResultsCallback(handleResults);

      // Iniciar cámara
      await mediaPipeService.startCamera(videoRef.current);

      setIsTracking(true);
      setServiceStatus(mediaPipeService.getStatus());
      
      console.log('✅ Tracking iniciado correctamente con servicio singleton');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al iniciar tracking: ${errorMessage}`);
      console.error('❌ Error al iniciar tracking:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Detener tracking
  const stopTracking = () => {
    console.log('🛑 Deteniendo tracking...');
    
    // Detener cámara (pero mantener instancia WASM para reutilización)
    mediaPipeService.stopCamera();
    
    // Limpiar callback
    mediaPipeService.setOnResultsCallback(null);
    
    // Limpiar canvas
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext('2d');
      if (canvasCtx) {
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    
    setIsTracking(false);
    setError(null);
    setServiceStatus(mediaPipeService.getStatus());
    
    console.log('✅ Tracking detenido - Instancia WASM conservada');
  };

  // Actualizar estado del servicio periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setServiceStatus(mediaPipeService.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Cleanup al desmontar componente - NO destruir servicio singleton
  useEffect(() => {
    return () => {
      if (isTracking) {
        mediaPipeService.stopCamera();
        mediaPipeService.setOnResultsCallback(null);
      }
    };
  }, [isTracking]);

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
              {!isTracking ? (
                <button
                  onClick={startTracking}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
                >
                  <Activity className="w-4 h-4" />
                  <span>{isLoading ? 'Iniciando...' : 'Iniciar'}</span>
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  <Camera className="w-4 h-4" />
                  <span>Detener</span>
                </button>
              )}
              
              {lastResults && (
                <button
                  onClick={() => exportTrackingData(lastResults)}
                  className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
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
              {!error && (
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
                          {isTracking ? '🟢 Tracking activo' : (isLoading ? '� Inicializando...' : '🔴 Detenido')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
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
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">
                        🔧 Estado del Servicio Singleton
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">WASM:</span>
                          <span className="ml-2 font-mono">
                            {serviceStatus.isInitialized ? '✅ Listo' : '❌ No init'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cámara:</span>
                          <span className="ml-2 font-mono">
                            {serviceStatus.isCameraActive ? '✅ Activa' : '❌ Detenida'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Callback:</span>
                          <span className="ml-2 font-mono">
                            {serviceStatus.hasCallback ? '✅ Set' : '❌ None'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Estado:</span>
                          <span className="ml-2 font-mono">
                            {serviceStatus.isInitializing ? '⏳ Init...' : '✅ Ready'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      💡 Instrucciones (Servicio Singleton)
                    </h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Haz clic en "Iniciar" para activar el tracking (WASM se inicializa una sola vez)</li>
                      <li>• Permite el acceso a la cámara cuando te lo solicite</li>
                      <li>• El servicio singleton mantiene la instancia WASM entre sesiones</li>
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