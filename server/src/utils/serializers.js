/**
 * Serializes a Case document for active gameplay.
 * STRICT ZERO-LEAK GUARANTEE:
 * Strips:
 *  - case.solution
 *  - suspect.privateProfile
 *  - clue.isRedHerring
 *  - clue.pointsTo
 *  - clue.text if not yet discovered (only location & title preview visible)
 */
export const serializeCaseForPlayer = (caseDoc) => {
  if (!caseDoc) return null;
  const raw = caseDoc.toObject ? caseDoc.toObject() : JSON.parse(JSON.stringify(caseDoc));

  // Explicitly delete sensitive root fields
  delete raw.solution;

  // Sanitize suspects: remove any privateProfile
  const sanitizedSuspects = (raw.suspects || []).map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    avatar: s.avatar,
    publicBio: s.publicBio
  }));

  // Sanitize clues:
  // - Remove isRedHerring & pointsTo
  // - If clue is not discovered yet, obscure description
  const sanitizedClues = (raw.clues || []).map((c) => ({
    id: c.id,
    title: c.title,
    location: c.location,
    category: c.category,
    discovered: Boolean(c.discovered),
    discoveredAt: c.discoveredAt,
    text: c.discovered ? c.text : 'Unexamined clue. Investigate location to uncover details.'
  }));

  // Sanitize hints:
  // Only reveal text for hints that have been explicitly used
  const sanitizedHints = (raw.hints || []).map((h) => ({
    level: h.level,
    used: Boolean(h.used),
    usedAt: h.usedAt,
    text: h.used ? h.text : `Level ${h.level} Hint (Locked)`
  }));

  return {
    _id: raw._id,
    title: raw.title,
    theme: raw.theme,
    premise: raw.premise,
    difficulty: raw.difficulty,
    story: raw.story,
    suspects: sanitizedSuspects,
    clues: sanitizedClues,
    hints: sanitizedHints,
    progress: raw.progress,
    interrogationLog: raw.interrogationLog || [],
    score: raw.score,
    status: raw.status,
    playerId: raw.playerId,
    nickname: raw.nickname,
    isDaily: raw.isDaily,
    createdAt: raw.createdAt
  };
};

/**
 * Serializes a Case document once it has been completed and accused.
 * Exposes full solution, red herrings, decisive clues, and AI critique.
 */
export const serializeCaseResult = (caseDoc) => {
  if (!caseDoc) return null;
  const raw = caseDoc.toObject ? caseDoc.toObject() : JSON.parse(JSON.stringify(caseDoc));

  return {
    _id: raw._id,
    title: raw.title,
    theme: raw.theme,
    premise: raw.premise,
    difficulty: raw.difficulty,
    story: raw.story,
    suspects: raw.suspects,
    clues: raw.clues, // Includes isRedHerring & full text now
    hints: raw.hints,
    solution: raw.solution,
    progress: raw.progress,
    accusation: raw.accusation,
    score: raw.score,
    detectiveCritique: raw.detectiveCritique,
    status: raw.status,
    playerId: raw.playerId,
    nickname: raw.nickname,
    createdAt: raw.createdAt
  };
};
