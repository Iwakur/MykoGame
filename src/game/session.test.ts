import { describe, expect, it } from 'vitest';
import { mykolaivHistoricPack } from '../content/packs/mykolaivHistoric';
import { createGameSession, submitGuess } from './session';

describe('game session', () => {
  it('starts learn mode without target region', () => {
    const session = createGameSession(mykolaivHistoricPack);

    expect(session.mode).toBe('learn');
    expect(session.targetRegionId).toBeNull();
    expect(session.answers).toHaveLength(0);
  });

  it('advances in test mode after a guess', () => {
    const session = createGameSession(mykolaivHistoricPack, { mode: 'test' });
    const firstId = session.targetRegionId;

    expect(firstId).not.toBeNull();

    const updated = submitGuess(session, mykolaivHistoricPack, firstId!);

    expect(updated.answers).toHaveLength(1);
    expect(updated.answers[0]?.isCorrect).toBe(true);
  });
});
