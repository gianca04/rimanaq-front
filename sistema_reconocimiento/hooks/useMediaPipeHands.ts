import { useEffect, useRef, useState } from 'react';
import { Landmark, Handedness } from '../types/gesture';
import { LandmarkNormalizer } from '../utils/gestureNormalization';

declare global {
  interface Window {
    Hands: new (config: { locateFile: (file: string) => string }) => unknown;
    Camera: new (video: HTMLVideoElement, config: { onFrame: () => Promise<void>; width: number; height: number }) => unknown;
    drawConnectors: (ctx: CanvasRenderingContext2D, landmarks: unknown, connections: unknown, style: { color: string; lineWidth: number }) => void;
    drawLandmarks: (ctx: CanvasRenderingContext2D, landmarks: unknown, style: { color: string; lineWidth: number; radius: number }) => void;
    HAND_CONNECTIONS: unknown;
  }
}

export interface HandResults {
  landmarks: Landmark[][];
  handedness: Handedness[];
  landmarksNormalizados?: Landmark[];
}

interface MediaPipeResults {
  multiHandLandmarks?: Landmark[][];
  multiHandedness?: { label: string; score: number; index: number }[];
  image: HTMLVideoElement;
}

export function useMediaPipeHands(
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentHands, setCurrentHands] = useState<HandResults | null>(null);
  const handsRef = useRef<unknown>(null);
  const cameraRef = useRef<unknown>(null);
  const landmarkNormalizer = useRef(new LandmarkNormalizer());

  useEffect(() => {
    const loadScripts = async () => {
      const scripts = [
        'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
      ];

      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        }
      }

      setIsLoaded(true);
    };

    loadScripts();
  }, []);

  useEffect(() => {
    if (!isLoaded || !videoRef.current || !canvasRef.current) return;

    const onResults = (results: MediaPipeResults) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const allLandmarks: Landmark[][] = [];
        const allHandedness: Handedness[] = [];

        // Procesar cada mano detectada
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          const handednessInfo = results.multiHandedness?.[i];

          // Dibujar conexiones y landmarks
          window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
            color: i === 0 ? '#00FF00' : '#0000FF', // Verde para primera mano, azul para segunda
            lineWidth: 3,
          });
          window.drawLandmarks(ctx, landmarks, {
            color: i === 0 ? '#FF0000' : '#FF00FF', // Rojo para primera mano, magenta para segunda
            lineWidth: 1,
            radius: 3,
          });

          // Convertir landmarks a nuestro formato
          const convertedLandmarks: Landmark[] = landmarks.map((lm: { x: number; y: number; z: number }) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
          }));

          allLandmarks.push(convertedLandmarks);

          // Convertir handedness a nuestro formato
          if (handednessInfo) {
            allHandedness.push({
              index: handednessInfo.index,
              score: handednessInfo.score,
              label: handednessInfo.label
            });
          }
        }

        // Procesar frame con normalización usando el código legacy
        const frameData = landmarkNormalizer.current.processarFrameParaCaptura(results);
        
        setCurrentHands({
          landmarks: allLandmarks,
          handedness: allHandedness,
          landmarksNormalizados: frameData?.landmarksNormalizados
        });
      } else {
        setCurrentHands(null);
      }

      ctx.restore();
    };

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    }) as { 
      setOptions: (options: { maxNumHands: number; modelComplexity: number; minDetectionConfidence: number; minTrackingConfidence: number }) => void;
      onResults: (callback: (results: MediaPipeResults) => void) => void;
      send: (data: { image: HTMLVideoElement }) => Promise<void>;
      close: () => void;
    };

    hands.setOptions({
      maxNumHands: 2, // Permitir hasta 2 manos como en el JSON de referencia
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await (handsRef.current as { send: (data: { image: HTMLVideoElement }) => Promise<void> }).send({ image: videoRef.current });
        }
      },
      width: 640,
      height: 480,
    }) as { start: () => void; stop: () => void };

    camera.start();
    cameraRef.current = camera;

    return () => {
      if (cameraRef.current && typeof (cameraRef.current as { stop?: () => void }).stop === 'function') {
        (cameraRef.current as { stop: () => void }).stop();
      }
      if (handsRef.current && typeof (handsRef.current as { close?: () => void }).close === 'function') {
        (handsRef.current as { close: () => void }).close();
      }
    };
  }, [isLoaded, videoRef, canvasRef]);

  return { 
    isLoaded, 
    currentHands,
    landmarkNormalizer: landmarkNormalizer.current
  };
}
