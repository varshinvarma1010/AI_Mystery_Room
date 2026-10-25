import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMockMysteryCase } from '../src/data/mockCase.js';
import { serializeCaseForPlayer, serializeCaseResult } from '../src/utils/serializers.js';

test('Anti-Leak Guarantee - GET active case never exposes sensitive solution or private profiles', () => {
  const fullCase = generateMockMysteryCase('medium', 'noir');

  // Verify full case contains secrets
  assert.ok(fullCase.solution, 'Raw mock case should contain solution');
  assert.ok(fullCase.suspects[0].privateProfile, 'Raw suspect should have privateProfile');
  assert.ok(fullCase.clues.some((c) => c.isRedHerring), 'Raw clues should have isRedHerring flag');

  // Run player serializer
  const playerDto = serializeCaseForPlayer(fullCase);

  // 1. Solution must be completely undefined
  assert.equal(playerDto.solution, undefined, 'Solution must NOT exist in player DTO');

  // 2. Suspect private profiles must be completely stripped
  playerDto.suspects.forEach((suspect) => {
    assert.equal(suspect.privateProfile, undefined, `Suspect ${suspect.name} must not leak privateProfile`);
    assert.equal(suspect.isCulprit, undefined, `Suspect ${suspect.name} must not leak isCulprit`);
  });

  // 3. Clue hidden flags (isRedHerring, pointsTo) must be completely stripped
  playerDto.clues.forEach((clue) => {
    assert.equal(clue.isRedHerring, undefined, `Clue ${clue.id} must not leak isRedHerring flag`);
    assert.equal(clue.pointsTo, undefined, `Clue ${clue.id} must not leak pointsTo`);
    // If not discovered, full text is obscured
    if (!clue.discovered) {
      assert.ok(clue.text.includes('Unexamined clue'), `Undiscovered clue ${clue.id} must not leak text details`);
    }
  });

  // 4. Locked hints must not leak text
  playerDto.hints.forEach((hint) => {
    if (!hint.used) {
      assert.ok(hint.text.includes('Locked'), `Unused hint level ${hint.level} must not leak text`);
    }
  });

  // JSON string check across the entire serialized payload
  const jsonString = JSON.stringify(playerDto);
  assert.equal(jsonString.includes('privateProfile'), false, 'Serialized JSON must not contain privateProfile');
  assert.equal(jsonString.includes('isRedHerring'), false, 'Serialized JSON must not contain isRedHerring');
  assert.equal(jsonString.includes('pointsTo'), false, 'Serialized JSON must not contain pointsTo');
  assert.equal(jsonString.includes('decisiveClueIds'), false, 'Serialized JSON must not contain decisiveClueIds');
});

test('Completed Case Result - Exposes solution and critique only after completion', () => {
  const fullCase = generateMockMysteryCase('medium', 'noir');
  fullCase.status = 'completed';
  fullCase.detectiveCritique = 'Superb deduction!';

  const resultDto = serializeCaseResult(fullCase);

  assert.ok(resultDto.solution, 'Completed result should include solution');
  assert.equal(resultDto.solution.culpritId, 'suspect_1');
  assert.equal(resultDto.detectiveCritique, 'Superb deduction!');
});
