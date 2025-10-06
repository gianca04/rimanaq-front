import { Landmark, Handedness, Frame, SequenceMetadata } from '../types/gesture';

export interface NormalizedLandmarks {
  landmarks: Landmark[];
  centroid: { x: number; y: number };
  scale: number;
}

export interface ProcessedFrameData {
  landmarks: Landmark[][];
  landmarksNormalizados: Landmark[];
  handedness: Handedness[];
}

/**
 * Clase para normalización de landmarks basada en el código legacy funcional
 */
export class LandmarkNormalizer {
  
  /**
   * Calcula el centroide de un conjunto de landmarks
   */
  calcularCentroide(landmarks: Landmark[]): { x: number; y: number } {
    let cx = 0, cy = 0;
    for (const lm of landmarks) {
      cx += lm.x;
      cy += lm.y;
    }
    return { x: cx / landmarks.length, y: cy / landmarks.length };
  }

  /**
   * Normaliza landmarks usando el método del código legacy
   */
  normalizarLandmarks(landmarks: Landmark[]): Landmark[] {
    if (!landmarks || landmarks.length === 0) {
      return [];
    }

    // Paso 1: Calcular centroide
    const centroide = this.calcularCentroide(landmarks);
    
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

  /**
   * Procesa un frame para captura, manejando múltiples manos
   */
  processarFrameParaCaptura(results: { multiHandLandmarks?: Landmark[][]; multiHandedness?: Handedness[] }): ProcessedFrameData | null {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      return null;
    }

    // Estrategia mejorada: normalizar cada mano por separado y luego combinar
    const normalizedByHand: { [key: string]: Landmark[] } = {};
    const handedness = results.multiHandedness || [];
    
    for (let i = 0; i < results.multiHandLandmarks.length; i++) {
      const handLandmarks = results.multiHandLandmarks[i];
      const handLabel = handedness[i]?.label || `Hand_${i}`;
      
      // Normalizar cada mano individualmente
      const normalized = this.normalizarLandmarks(handLandmarks);
      normalizedByHand[handLabel] = normalized;
    }

    // Crear landmarks normalizados en orden consistente: Left primero, luego Right
    const allNormalizedLandmarks: Landmark[] = [];
    
    // Agregar mano izquierda si existe
    if (normalizedByHand['Left']) {
      allNormalizedLandmarks.push(...normalizedByHand['Left']);
    }
    
    // Agregar mano derecha si existe  
    if (normalizedByHand['Right']) {
      allNormalizedLandmarks.push(...normalizedByHand['Right']);
    }
    
    // Si hay manos sin etiquetar, agregarlas al final
    for (const [label, landmarks] of Object.entries(normalizedByHand)) {
      if (label !== 'Left' && label !== 'Right') {
        allNormalizedLandmarks.push(...landmarks);
      }
    }
    
    return {
      landmarks: results.multiHandLandmarks,
      landmarksNormalizados: allNormalizedLandmarks,
      handedness: handedness
    };
  }

  /**
   * Calcula similitud entre frames usando landmarks normalizados con estrategia flexible
   */
  calculateFrameSimilarity(frame1: Frame | ProcessedFrameData, frame2: Frame | ProcessedFrameData): number {
    // Extraer información de las manos para ambos frames
    const hands1 = this.extractHandsByLabel(frame1);
    const hands2 = this.extractHandsByLabel(frame2);
    
    // Si no hay manos en alguno de los frames, similitud 0
    if (Object.keys(hands1).length === 0 || Object.keys(hands2).length === 0) {
      return 0;
    }
    
    // Estrategia de comparación flexible
    const similarities: number[] = [];
    
    // Comparar manos que coinciden en etiqueta
    for (const handLabel of ['Left', 'Right']) {
      if (hands1[handLabel] && hands2[handLabel]) {
        const sim = this.compareHandLandmarks(hands1[handLabel], hands2[handLabel]);
        similarities.push(sim);
      }
    }
    
    // Si no hay coincidencias exactas, intentar comparación cruzada con penalización
    if (similarities.length === 0) {
      // Comparar la mejor coincidencia posible entre manos disponibles
      const allHands1 = Object.values(hands1);
      const allHands2 = Object.values(hands2);
      
      if (allHands1.length > 0 && allHands2.length > 0) {
        let bestSim = 0;
        for (const h1 of allHands1) {
          for (const h2 of allHands2) {
            const sim = this.compareHandLandmarks(h1, h2);
            bestSim = Math.max(bestSim, sim);
          }
        }
        // Aplicar penalización por comparación cruzada
        similarities.push(bestSim * 0.7);
      }
    }
    
    // Si hay manos faltantes, penalizar según el contexto
    const totalHandsFrame1 = Object.keys(hands1).length;
    const totalHandsFrame2 = Object.keys(hands2).length;
    const missingHandsPenalty = Math.abs(totalHandsFrame1 - totalHandsFrame2) * 0.2;
    
    // Calcular similitud promedio ponderada
    const avgSimilarity = similarities.length > 0 
      ? similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length
      : 0;
    
    // Aplicar penalización por manos faltantes
    const finalSimilarity = Math.max(0, avgSimilarity - missingHandsPenalty);
    
    return finalSimilarity;
  }

  /**
   * Extrae landmarks de manos organizados por etiqueta (Left/Right)
   */
  private extractHandsByLabel(frame: Frame | ProcessedFrameData): { [label: string]: Landmark[] } {
    const hands: { [label: string]: Landmark[] } = {};
    
    if ('landmarks' in frame && frame.landmarks && frame.handedness) {
      // Procesar cada mano con su etiqueta correspondiente
      for (let i = 0; i < frame.landmarks.length && i < frame.handedness.length; i++) {
        const handLandmarks = Array.isArray(frame.landmarks[i]) 
          ? frame.landmarks[i] as Landmark[]
          : frame.landmarks as unknown as Landmark[];
        const handLabel = frame.handedness[i]?.label || `Hand_${i}`;
        
        // Normalizar landmarks de esta mano específica
        hands[handLabel] = this.normalizarLandmarks(handLandmarks);
      }
    } else if ('landmarksNormalizados' in frame && frame.landmarksNormalizados && frame.handedness) {
      // Si ya están normalizados, dividirlos por mano (asumiendo 21 landmarks por mano)
      const landmarksPerHand = 21;
      const handedness = frame.handedness;
      
      for (let i = 0; i < handedness.length; i++) {
        const startIdx = i * landmarksPerHand;
        const endIdx = startIdx + landmarksPerHand;
        const handLandmarks = frame.landmarksNormalizados.slice(startIdx, endIdx);
        
        if (handLandmarks.length === landmarksPerHand) {
          hands[handedness[i].label] = handLandmarks;
        }
      }
    }
    
    return hands;
  }

  /**
   * Compara landmarks de dos manos individuales
   */
  private compareHandLandmarks(landmarks1: Landmark[], landmarks2: Landmark[]): number {
    if (!landmarks1 || !landmarks2 || landmarks1.length !== landmarks2.length) {
      return 0;
    }

    let totalDistance = 0;
    let validPoints = 0;

    for (let i = 0; i < landmarks1.length; i++) {
      const lm1 = landmarks1[i];
      const lm2 = landmarks2[i];

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
    const avgDistance = totalDistance / validPoints;
    const similarity = Math.max(0, 1 - avgDistance * 1.5);

    return similarity;
  }

  /**
   * Genera metadata de secuencia para un frame
   */
  generateSequenceMetadata(landmarks: Landmark[][], handedness: Handedness[]): SequenceMetadata {
    if (!landmarks || landmarks.length === 0) {
      return {
        captureQuality: 0,
        centroide: { x: 0, y: 0 },
        boundingBox: { x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0 },
        handSize: { length: 0, width: 0, area: 0 }
      };
    }

    // Combinar todos los landmarks de todas las manos
    const allLandmarks = landmarks.flat();
    
    // Calcular centroide
    const centroide = this.calcularCentroide(allLandmarks);
    
    // Calcular bounding box
    const xCoords = allLandmarks.map(l => l.x);
    const yCoords = allLandmarks.map(l => l.y);
    
    const minX = Math.min(...xCoords);
    const maxX = Math.max(...xCoords);
    const minY = Math.min(...yCoords);
    const maxY = Math.max(...yCoords);
    
    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
    
    // Calcular tamaño de mano
    const handSize = {
      length: boundingBox.height,
      width: boundingBox.width,
      area: boundingBox.width * boundingBox.height
    };
    
    // Calcular calidad de captura basada en número de manos y confianza
    let captureQuality = 0;
    if (handedness && handedness.length > 0) {
      const avgConfidence = handedness.reduce((sum, h) => sum + h.score, 0) / handedness.length;
      captureQuality = Math.round(avgConfidence * 100);
    }
    
    return {
      captureQuality,
      centroide,
      boundingBox,
      handSize
    };
  }
}

// Funciones de compatibilidad con el código existente
export function normalizeLandmarks(landmarks: Landmark[]): NormalizedLandmarks {
  const normalizer = new LandmarkNormalizer();
  const normalized = normalizer.normalizarLandmarks(landmarks);
  const centroid = normalizer.calcularCentroide(landmarks);
  
  // Calcular escala para compatibilidad
  const distances = normalized.map(l => Math.sqrt(l.x * l.x + l.y * l.y));
  const scale = distances.length > 0 ? Math.max(...distances) : 1;
  
  return { landmarks: normalized, centroid, scale };
}

export function compareLandmarks(
  landmarks1: Landmark[],
  landmarks2: Landmark[]
): number {
  const normalizer = new LandmarkNormalizer();
  
  // Usar el método mejorado del normalizer
  const frame1 = { landmarks: [landmarks1], landmarksNormalizados: [] as Landmark[], handedness: [] as Handedness[] };
  const frame2 = { landmarks: [landmarks2], landmarksNormalizados: [] as Landmark[], handedness: [] as Handedness[] };
  
  const similarity = normalizer.calculateFrameSimilarity(frame1, frame2);
  return similarity * 100;
}
