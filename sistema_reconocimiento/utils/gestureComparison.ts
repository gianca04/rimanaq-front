import { Landmark, Frame, Handedness } from '../types/gesture';
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

  // Mapear manos actuales por etiqueta
  const currentHandsMap: { [label: string]: Landmark[] } = {};
  currentHands.handedness.forEach((hand, index) => {
    if (index < currentHands.landmarks.length) {
      currentHandsMap[hand.label] = currentHands.landmarks[index];
    }
  });

  // Mapear manos objetivo por etiqueta
  const targetHandsMap: { [label: string]: Landmark[] } = {};
  if (targetFrame.handedness && targetFrame.landmarks) {
    targetFrame.handedness.forEach((hand, index) => {
      if (index < targetFrame.landmarks!.length) {
        targetHandsMap[hand.label] = targetFrame.landmarks![index];
      }
    });
  }

  // Calcular similitud individual para mano izquierda
  if (currentHandsMap['Left'] && targetHandsMap['Left']) {
    const leftFrame1 = {
      landmarks: [currentHandsMap['Left']],
      landmarksNormalizados: normalizer.normalizarLandmarks(currentHandsMap['Left']),
      handedness: [{ index: 0, score: 1, label: 'Left' }]
    };
    const leftFrame2 = {
      landmarks: [targetHandsMap['Left']],
      landmarksNormalizados: normalizer.normalizarLandmarks(targetHandsMap['Left']),
      handedness: [{ index: 0, score: 1, label: 'Left' }]
    };
    details.leftHandSimilarity = normalizer.calculateFrameSimilarity(leftFrame1, leftFrame2) * 100;
  }

  // Calcular similitud individual para mano derecha
  if (currentHandsMap['Right'] && targetHandsMap['Right']) {
    const rightFrame1 = {
      landmarks: [currentHandsMap['Right']],
      landmarksNormalizados: normalizer.normalizarLandmarks(currentHandsMap['Right']),
      handedness: [{ index: 0, score: 1, label: 'Right' }]
    };
    const rightFrame2 = {
      landmarks: [targetHandsMap['Right']],
      landmarksNormalizados: normalizer.normalizarLandmarks(targetHandsMap['Right']),
      handedness: [{ index: 0, score: 1, label: 'Right' }]
    };
    details.rightHandSimilarity = normalizer.calculateFrameSimilarity(rightFrame1, rightFrame2) * 100;
  }

  // Si falta una mano en el frame actual pero existe en el objetivo, intentar comparación cruzada
  if (!currentHandsMap['Left'] && targetHandsMap['Left'] && currentHandsMap['Right']) {
    // Comparar mano derecha actual con mano izquierda objetivo (con penalización)
    const crossFrame1 = {
      landmarks: [currentHandsMap['Right']],
      landmarksNormalizados: normalizer.normalizarLandmarks(currentHandsMap['Right']),
      handedness: [{ index: 0, score: 1, label: 'Right' }]
    };
    const crossFrame2 = {
      landmarks: [targetHandsMap['Left']],
      landmarksNormalizados: normalizer.normalizarLandmarks(targetHandsMap['Left']),
      handedness: [{ index: 0, score: 1, label: 'Left' }]
    };
    const crossSimilarity = normalizer.calculateFrameSimilarity(crossFrame1, crossFrame2) * 100 * 0.6; // Penalización
    details.leftHandSimilarity = Math.round(crossSimilarity * 10) / 10;
  }

  if (!currentHandsMap['Right'] && targetHandsMap['Right'] && currentHandsMap['Left']) {
    // Comparar mano izquierda actual con mano derecha objetivo (con penalización)
    const crossFrame1 = {
      landmarks: [currentHandsMap['Left']],
      landmarksNormalizados: normalizer.normalizarLandmarks(currentHandsMap['Left']),
      handedness: [{ index: 0, score: 1, label: 'Left' }]
    };
    const crossFrame2 = {
      landmarks: [targetHandsMap['Right']],
      landmarksNormalizados: normalizer.normalizarLandmarks(targetHandsMap['Right']),
      handedness: [{ index: 0, score: 1, label: 'Right' }]
    };
    const crossSimilarity = normalizer.calculateFrameSimilarity(crossFrame1, crossFrame2) * 100 * 0.6; // Penalización
    details.rightHandSimilarity = Math.round(crossSimilarity * 10) / 10;
  }

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
