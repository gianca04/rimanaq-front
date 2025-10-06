export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface Handedness {
  index: number;
  score: number;
  label: string;
}

export interface SequenceMetadata {
  captureQuality: number;
  centroide: {
    x: number;
    y: number;
  };
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
    centerX: number;
    centerY: number;
  };
  handSize: {
    length: number;
    width: number;
    area: number;
  };
}

export interface Frame {
  id: number;
  timestamp: string;
  landmarks: Landmark[][];
  landmarksNormalizados: Landmark[];
  handedness: Handedness[];
  gestureName: string;
  frameIndex: number;
  sequenceMetadata: SequenceMetadata;
}

export interface GestureData {
  id: number;
  name: string;
  frames: Frame[];
  frameCount: number;
  createdAt: string;
  isSequential: boolean;
  sequenceMetadata: {
    consistency: {
      isConsistent: boolean;
      issues: string[];
      stats: {
        avgQuality: number;
        avgHandSize: number;
        sizeVariation: number;
        avgInterval: number;
      };
    };
    avgQuality: number;
    normalizedFrames: boolean;
    captureDevice: string;
    version: string;
  };
}

export interface GestureFile {
  version: string;
  createdAt: string;
  gesture: GestureData;
}
