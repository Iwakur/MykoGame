import type { GameMode, GameSession, RegionPack } from './types';

interface CreateGameOptions {
  mode?: GameMode;
}

export function createGameSession(pack: RegionPack, options: CreateGameOptions = {}): GameSession {
  const mode = options.mode ?? 'learn';
  const regionIds = pack.regions.features.map((feature) => feature.properties.id);

  return {
    mode,
    targetRegionId: mode === 'test' ? regionIds[0] ?? null : null,
    remainingRegionIds: mode === 'test' ? regionIds.slice(1) : [],
    answers: []
  };
}

export function submitGuess(session: GameSession, pack: RegionPack, guessedRegionId: string): GameSession {
  if (session.mode !== 'test' || !session.targetRegionId) {
    return session;
  }

  const expected = pack.regions.features.find((feature) => feature.properties.id === session.targetRegionId);
  const guessed = pack.regions.features.find((feature) => feature.properties.id === guessedRegionId);

  if (!expected || !guessed) {
    return session;
  }

  const answer = {
    expectedRegionId: expected.properties.id,
    expectedName: expected.properties.name,
    guessedRegionId: guessed.properties.id,
    guessedName: guessed.properties.name,
    isCorrect: expected.properties.id === guessed.properties.id
  };

  return {
    ...session,
    answers: [...session.answers, answer],
    targetRegionId: session.remainingRegionIds[0] ?? null,
    remainingRegionIds: session.remainingRegionIds.slice(1)
  };
}
