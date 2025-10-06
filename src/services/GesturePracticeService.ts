/**
 * Servicio para manejar la práctica de gestos secuenciales
 */

import type { 
  GestureFile, 
  GestureData, 
  GestureFrame, 
  PracticeSession, 
  PracticeResult,
  Landmark 
} from '../types/gesture';

export class GesturePracticeService {
  private currentSession: PracticeSession | null = null;
  private onFrameProgress: ((frameIndex: number, total: number, similarity: number) => void) | null = null;
  private onSessionComplete: ((results: PracticeResult[]) => void) | null = null;
  private sessionResults: PracticeResult[] = [];

  /**
   * Importar un archivo JSON con gesto
   */
  async importGestureFromFile(file: File): Promise<GestureData> {
    try {
      const text = await file.text();
      const gestureFile: GestureFile = JSON.parse(text);
      
      // Validar estructura del archivo
      if (!gestureFile.gesture || !gestureFile.gesture.frames) {
        throw new Error('Formato de archivo inválido');
      }

      // Validar que tenga frames
      if (gestureFile.gesture.frames.length === 0) {
        throw new Error('El gesto no contiene frames');
      }

      return gestureFile.gesture;
    } catch (error) {
      console.error('Error al importar gesto:', error);
      throw new Error('No se pudo cargar el archivo de gesto');
    }
  }

  /**
   * Iniciar una nueva sesión de práctica
   */
  startPracticeSession(
    gesture: GestureData, 
    similarityThreshold: number = 80
  ): PracticeSession {
    this.currentSession = {
      gesture,
      currentFrameIndex: 0,
      isActive: true,
      startedAt: new Date(),
      completedFrames: [],
      similarityThreshold
    };

    this.sessionResults = [];
    
    console.log(`🎯 Iniciando práctica de "${gesture.name}" (${gesture.frameCount} frames)`);
    return this.currentSession;
  }

  /**
   * Detener la sesión actual
   */
  stopPracticeSession(): void {
    if (this.currentSession) {
      this.currentSession.isActive = false;
      console.log(`⏹️ Práctica detenida: ${this.currentSession.gesture.name}`);
    }
    this.currentSession = null;
    this.sessionResults = [];
  }

  /**
   * Procesar frame actual contra el frame objetivo
   */
  processCurrentFrame(currentLandmarks: Landmark[][]): { similarity: number; passed: boolean } | null {
    if (!this.currentSession || !this.currentSession.isActive) {
      return null;
    }

    // Validar que tenemos landmarks de mano
    if (!currentLandmarks || currentLandmarks.length === 0) {
      return { similarity: 0, passed: false };
    }

    const targetFrame = this.currentSession.gesture.frames[this.currentSession.currentFrameIndex];
    const currentHandLandmarks = currentLandmarks[0]; // Primera mano detectada

    // Normalizar landmarks actuales usando la misma lógica que el frame objetivo
    const normalizedCurrent = this.normalizeLandmarks(currentHandLandmarks);
    
    // Comparar con landmarks normalizados del frame objetivo
    const similarity = this.calculateSimilarity(normalizedCurrent, targetFrame.landmarksNormalizados);
    const passed = similarity >= this.currentSession.similarityThreshold;

    // Registrar resultado
    const result: PracticeResult = {
      frameIndex: this.currentSession.currentFrameIndex,
      similarity,
      passed,
      timestamp: new Date()
    };

    this.sessionResults.push(result);

    // Notificar progreso
    if (this.onFrameProgress) {
      this.onFrameProgress(
        this.currentSession.currentFrameIndex,
        this.currentSession.gesture.frameCount,
        similarity
      );
    }

    // Si el frame es válido, avanzar
    if (passed) {
      this.advanceFrame();
    }

    return { similarity, passed };
  }

  /**
   * Avanzar al siguiente frame
   */
  private advanceFrame(): void {
    if (!this.currentSession) return;

    this.currentSession.completedFrames.push(this.currentSession.currentFrameIndex);
    this.currentSession.currentFrameIndex++;

    // Verificar si completamos todos los frames
    if (this.currentSession.currentFrameIndex >= this.currentSession.gesture.frameCount) {
      this.completeSession();
    }
  }

  /**
   * Completar la sesión
   */
  private completeSession(): void {
    if (!this.currentSession) return;

    console.log(`🏆 Práctica completada: ${this.currentSession.gesture.name}`);
    this.currentSession.isActive = false;

    // Notificar completación
    if (this.onSessionComplete) {
      this.onSessionComplete(this.sessionResults);
    }
  }

  /**
   * Normalizar landmarks usando centroide y escala
   */
  private normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
    if (!landmarks || landmarks.length < 21) {
      return [];
    }

    // Calcular centroide
    const centroide = {
      x: landmarks.reduce((sum, p) => sum + p.x, 0) / landmarks.length,
      y: landmarks.reduce((sum, p) => sum + p.y, 0) / landmarks.length
    };

    // Calcular escala basada en la distancia máxima al centroide
    let maxDistance = 0;
    for (const landmark of landmarks) {
      const distance = Math.sqrt(
        Math.pow(landmark.x - centroide.x, 2) + 
        Math.pow(landmark.y - centroide.y, 2)
      );
      maxDistance = Math.max(maxDistance, distance);
    }

    // Normalizar puntos
    return landmarks.map(landmark => ({
      x: maxDistance > 0 ? (landmark.x - centroide.x) / maxDistance : 0,
      y: maxDistance > 0 ? (landmark.y - centroide.y) / maxDistance : 0,
      z: landmark.z ?? 0
    }));
  }

  /**
   * Calcular similitud entre dos conjuntos de landmarks normalizados
   */
  private calculateSimilarity(current: Landmark[], target: Landmark[]): number {
    if (!current || !target || current.length !== target.length) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < current.length; i++) {
      const distance = Math.sqrt(
        Math.pow(current[i].x - target[i].x, 2) + 
        Math.pow(current[i].y - target[i].y, 2)
      );
      totalDistance += distance;
    }

    const avgDistance = totalDistance / current.length;
    const similarity = Math.max(0, 100 - (avgDistance * 100));
    
    return similarity;
  }

  /**
   * Obtener información de la sesión actual
   */
  getCurrentSession(): PracticeSession | null {
    return this.currentSession;
  }

  /**
   * Obtener frame actual objetivo
   */
  getCurrentTargetFrame(): GestureFrame | null {
    if (!this.currentSession) return null;
    return this.currentSession.gesture.frames[this.currentSession.currentFrameIndex] || null;
  }

  /**
   * Configurar callbacks
   */
  setOnFrameProgress(callback: (frameIndex: number, total: number, similarity: number) => void): void {
    this.onFrameProgress = callback;
  }

  setOnSessionComplete(callback: (results: PracticeResult[]) => void): void {
    this.onSessionComplete = callback;
  }

  /**
   * Obtener estadísticas de la sesión
   */
  getSessionStats(): {
    completedFrames: number;
    totalFrames: number;
    progress: number;
    avgSimilarity: number;
  } | null {
    if (!this.currentSession) return null;

    const avgSimilarity = this.sessionResults.length > 0 
      ? this.sessionResults.reduce((sum, r) => sum + r.similarity, 0) / this.sessionResults.length
      : 0;

    return {
      completedFrames: this.currentSession.completedFrames.length,
      totalFrames: this.currentSession.gesture.frameCount,
      progress: (this.currentSession.completedFrames.length / this.currentSession.gesture.frameCount) * 100,
      avgSimilarity: Math.round(avgSimilarity)
    };
  }
}

// Exportar instancia singleton
export const gesturePracticeService = new GesturePracticeService();