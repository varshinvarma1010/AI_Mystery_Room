/**
 * Calculates authoritative mystery score on backend
 */
export const calculateCaseScore = ({
  difficulty,
  isCorrectCulprit,
  isCorrectMotive,
  isCorrectMethod,
  chosenSupportingClueIds = [],
  decisiveClueIds = [],
  redHerringClueIds = [],
  discoveredCluesCount = 0,
  hintsUsedCount = 0,
  questionsAskedCount = 0,
  validContradictionsCount = 0,
  invalidContradictionsCount = 0,
  timeRemainingSeconds = 0
}) => {
  // 1. Base Accusation points
  const baseTable = { easy: 100, medium: 150, hard: 200 };
  const baseAccusation = isCorrectCulprit ? (baseTable[difficulty] || 150) : 0;

  // 2. Structured bonuses (only if culprit is correct)
  const motiveBonus = isCorrectCulprit && isCorrectMotive ? 25 : 0;
  const methodBonus = isCorrectCulprit && isCorrectMethod ? 25 : 0;

  // 3. Supporting clues bonus/penalty
  let supportingCluesBonus = 0;
  if (isCorrectCulprit) {
    chosenSupportingClueIds.forEach((cId) => {
      if (decisiveClueIds.includes(cId)) {
        supportingCluesBonus += 10;
      } else if (redHerringClueIds.includes(cId)) {
        supportingCluesBonus -= 10;
      }
    });
  }

  // 4. Investigation points
  const cluesDiscoveredPoints = discoveredCluesCount * 5;
  const hintsPenalty = hintsUsedCount * 10;
  const questionsPenalty = questionsAskedCount * 2;
  const contradictionPoints = (validContradictionsCount * 10) - (invalidContradictionsCount * 5);
  const timeBonus = Math.floor(timeRemainingSeconds / 10);

  // Compute total (floor at 0)
  const rawTotal = baseAccusation +
    motiveBonus +
    methodBonus +
    supportingCluesBonus +
    cluesDiscoveredPoints -
    hintsPenalty -
    questionsPenalty +
    contradictionPoints +
    timeBonus;

  const total = Math.max(0, rawTotal);

  // Determine Detective Tier
  let tier = 'Case Cold';
  if (isCorrectCulprit) {
    if (isCorrectMotive && isCorrectMethod && total >= 150) {
      tier = 'Master Detective';
    } else if (isCorrectMotive || isCorrectMethod) {
      tier = 'Sharp Eye';
    } else {
      tier = 'Close Call';
    }
  }

  return {
    baseAccusation,
    motiveBonus,
    methodBonus,
    supportingCluesBonus,
    cluesDiscoveredPoints,
    hintsPenalty,
    questionsPenalty,
    contradictionPoints,
    timeBonus,
    total,
    tier
  };
};
