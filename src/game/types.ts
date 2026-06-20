export type Position = [longitude: number, latitude: number];

export interface RegionProperties {
  id: string;
  name: string;
  description: string;
}

export interface RegionFeature {
  type: 'Feature';
  properties: RegionProperties;
  geometry: {
    type: 'Polygon';
    coordinates: Position[][];
  };
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: RegionFeature[];
}

export interface RegionPack {
  meta: {
    id: string;
    name: string;
    summary: string;
  };
  regions: FeatureCollection;
}

export type GameMode = 'learn' | 'test';

export interface AnswerRecord {
  expectedRegionId: string;
  expectedName: string;
  guessedRegionId: string;
  guessedName: string;
  isCorrect: boolean;
}

export interface GameSession {
  mode: GameMode;
  targetRegionId: string | null;
  remainingRegionIds: string[];
  answers: AnswerRecord[];
}
