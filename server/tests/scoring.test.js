import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCaseScore } from '../src/utils/scoringEngine.js';

test('Scoring Engine - Easy difficulty correct accusation with all bonuses', () => {
  const result = calculateCaseScore({
    difficulty: 'easy',
    isCorrectCulprit: true,
    isCorrectMotive: true,
    isCorrectMethod: true,
    chosenSupportingClueIds: ['clue_1', 'clue_2'],
    decisiveClueIds: ['clue_1', 'clue_2'],
    redHerringClueIds: ['clue_4'],
    discoveredCluesCount: 5, // 5 * 5 = +25
    hintsUsedCount: 1, // 1 * 10 = -10
    questionsAskedCount: 4, // 4 * 2 = -8
    validContradictionsCount: 1, // +10
    invalidContradictionsCount: 0,
    timeRemainingSeconds: 50 // floor(50/10) = +5
  });

  // Base: 100 + Motive: 25 + Method: 25 + Supporting: 20 + Clues: 25 - Hint: 10 - Questions: 8 + Contradiction: 10 + Time: 5
  // = 192
  assert.equal(result.baseAccusation, 100);
  assert.equal(result.motiveBonus, 25);
  assert.equal(result.methodBonus, 25);
  assert.equal(result.supportingCluesBonus, 20);
  assert.equal(result.cluesDiscoveredPoints, 25);
  assert.equal(result.hintsPenalty, 10);
  assert.equal(result.questionsPenalty, 8);
  assert.equal(result.contradictionPoints, 10);
  assert.equal(result.timeBonus, 5);
  assert.equal(result.total, 192);
  assert.equal(result.tier, 'Master Detective');
});

test('Scoring Engine - Wrong accusation yields Case Cold and zero base/bonus points', () => {
  const result = calculateCaseScore({
    difficulty: 'medium',
    isCorrectCulprit: false,
    isCorrectMotive: false,
    isCorrectMethod: false,
    chosenSupportingClueIds: ['clue_1'],
    decisiveClueIds: ['clue_2'],
    redHerringClueIds: ['clue_1'],
    discoveredCluesCount: 4, // +20
    hintsUsedCount: 3, // -30
    questionsAskedCount: 6, // -12
    validContradictionsCount: 0,
    invalidContradictionsCount: 1 // -5
  });

  assert.equal(result.baseAccusation, 0);
  assert.equal(result.motiveBonus, 0);
  assert.equal(result.methodBonus, 0);
  assert.equal(result.supportingCluesBonus, 0);
  // Total cannot be negative, must be floored at 0
  assert.equal(result.total, 0);
  assert.equal(result.tier, 'Case Cold');
});

test('Scoring Engine - Red Herring chosen as supporting clue penalizes score', () => {
  const result = calculateCaseScore({
    difficulty: 'hard',
    isCorrectCulprit: true,
    isCorrectMotive: false,
    isCorrectMethod: false,
    chosenSupportingClueIds: ['clue_red_1'],
    decisiveClueIds: ['clue_1', 'clue_2'],
    redHerringClueIds: ['clue_red_1'],
    discoveredCluesCount: 3, // +15
    hintsUsedCount: 0,
    questionsAskedCount: 0
  });

  // Base: 200 - 10 (red herring penalty) + 15 (discovered clues) = 205
  assert.equal(result.baseAccusation, 200);
  assert.equal(result.supportingCluesBonus, -10);
  assert.equal(result.total, 205);
  assert.equal(result.tier, 'Close Call');
});
