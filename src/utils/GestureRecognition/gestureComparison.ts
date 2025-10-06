import { Landmark, Frame, Handedness } from '../../types/GestureRecognition/gesture';
import { LandmarkNormalizer } from './gestureNormalization';

export interface ComparisonResult {
  similarity: number;
  isMatch: boolean;
  matchThreshold: number;
  details?: {
    leftHandSimilarity?: number;
    rightHandSimilarity?: number;
    bothHandsDetected: boolean;
    expectedHands: number;
  };
}

export interface CurrentHandsData {
  landmarks: Landmark[][];
  handedness: Handedness[];
  landmarksNormalizados?: Landmark[];
}

/**
 * Compara los landmarks actuales con un frame objetivo, soportando múltiples manos con estrategia flexible
 */
export function compareWithFrame(
  currentHands: CurrentHandsData,
  targetFrame: Frame,
  threshold: number = 75
): ComparisonResult {
  if (!currentHands || !currentHands.landmarks || currentHands.landmarks.length === 0) {
    return {
      similarity: 0,
      isMatch: false,
      matchThreshold: threshold,
      details: {
        bothHandsDetected: false,
        expectedHands: targetFrame.landmarks?.length || 0
      }
    };
  }

  const normalizer = new LandmarkNormalizer();

  // Crear objetos compatibles para la comparación mejorada
  const currentFrameData = {
    landmarks: currentHands.landmarks,
    landmarksNormalizados: currentHands.landmarksNormalizados || [],
    handedness: currentHands.handedness
  };

  // Usar el método de comparación mejorado del normalizer
  const similarity = normalizer.calculateFrameSimilarity(currentFrameData, targetFrame) * 100;

  // Calcular detalles adicionales para análisis
  const details = calculateComparisonDetails(currentHands, targetFrame, normalizer);

  return {
    similarity: Math.round(similarity * 10) / 10,
    isMatch: similarity >= threshold,
    matchThreshold: threshold,
    details
  };
}

/**
 * Calcula detalles adicionales de la comparación entre manos individuales
 */
function calculateComparisonDetails(
  currentHands: CurrentHandsData,
  targetFrame: Frame,
  normalizer: LandmarkNormalizer
) {
  const details = {
    bothHandsDetected: currentHands.landmarks.length >= 2,
    expectedHands: targetFrame.landmarks?.length || 0,
    leftHandSimilarity: undefined as number | undefined,
    rightHandSimilarity: undefined as number | undefined
  };

  return details;
}

export function getSimilarityColor(similarity: number): string {
  if (similarity >= 85) return 'text-green-500';
  if (similarity >= 70) return 'text-yellow-500';
  if (similarity >= 50) return 'text-orange-500';
  return 'text-red-500';
}

export function getSimilarityBgColor(similarity: number): string {
  if (similarity >= 85) return 'bg-green-500';
  if (similarity >= 70) return 'bg-yellow-500';
  if (similarity >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getSimilarityMessage(similarity: number): string {
  if (similarity >= 85) return '¡Excelente!';
  if (similarity >= 70) return '¡Casi perfecto!';
  if (similarity >= 50) return 'Continúa ajustando';
  return 'Intenta de nuevo';
}

export function calculateLandmarkDistance(l1: Landmark, l2: Landmark): number {
  const dx = l1.x - l2.x;
  const dy = l1.y - l2.y;
  const dz = l1.z - l2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function calculateCentroide(landmarks: Landmark[]): { x: number; y: number } {
  let cx = 0, cy = 0;
  for (const lm of landmarks) {
    cx += lm.x;
    cy += lm.y;
  }
  return { x: cx / landmarks.length, y: cy / landmarks.length };
}

export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  if (landmarks.length === 0) return landmarks;

  // Paso 1: Calcular centroide
  const centroide = calculateCentroide(landmarks);
  
  // Paso 2: Trasladar landmarks al centro (restar centroide)
  const landmarksTransladados = landmarks.map(lm => ({
    x: lm.x - centroide.x,
    y: lm.y - centroide.y,
    z: lm.z || 0 // Mantener z si existe
  }));
  
  // Paso 3: Calcular la distancia máxima desde el centro
  let maxDist = 0;
  for (const lm of landmarksTransladados) {
    const dist = Math.sqrt(lm.x * lm.x + lm.y * lm.y);
    if (dist > maxDist) maxDist = dist;
  }
  
  // Evitar división por cero
  if (maxDist === 0) return landmarksTransladados;
  
  // Paso 4: Escalar landmarks para normalizar el tamaño
  const landmarksNormalizados = landmarksTransladados.map(lm => ({
    x: lm.x / maxDist,
    y: lm.y / maxDist,
    z: lm.z || 0
  }));
  
  return landmarksNormalizados;
}

export function compareGestures(userLandmarks: Landmark[], targetLandmarks: Landmark[]): number {
  if (!userLandmarks || !targetLandmarks || userLandmarks.length !== targetLandmarks.length) {
    return 0;
  }

  const normalizedUser = normalizeLandmarks(userLandmarks);
  const normalizedTarget = normalizeLandmarks(targetLandmarks);

  // Calcular distancia euclidiana entre landmarks normalizados
  let totalDistance = 0;
  let validPoints = 0;

  for (let i = 0; i < normalizedUser.length; i++) {
    const lm1 = normalizedUser[i];
    const lm2 = normalizedTarget[i];

    if (lm1 && lm2) {
      const dx = lm1.x - lm2.x;
      const dy = lm1.y - lm2.y;
      const dz = (lm1.z || 0) - (lm2.z || 0);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      totalDistance += distance;
      validPoints++;
    }
  }

  if (validPoints === 0) return 0;

  // Convertir distancia a similitud (0-1)
  // Con landmarks normalizados, las distancias son más consistentes
  const avgDistance = totalDistance / validPoints;
  const similarity = Math.max(0, 1 - avgDistance * 1.5); // Factor ajustado para landmarks normalizados

  return similarity * 100;
}

export function processFrameForCapture(landmarks: Landmark[][]): { 
  landmarks: Landmark[][], 
  landmarksNormalizados: Landmark[], 
  handedness?: unknown[] 
} | null {
  if (!landmarks || landmarks.length === 0) {
    return null;
  }

  const firstHandLandmarks = landmarks[0]; // Primera mano detectada
  const landmarksNormalizados = normalizeLandmarks(firstHandLandmarks);
  
  return {
    landmarks: landmarks, // Mantener originales para visualización
    landmarksNormalizados: landmarksNormalizados, // Landmarks procesados para comparación
    handedness: [] // Se puede extender más tarde
  };
}
