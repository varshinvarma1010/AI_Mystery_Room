/**
 * Builds the Pass-2 Gemini prompt for verifying case solvability and logical consistency
 */
export const buildSolvabilityPrompt = (caseData) => {
  return `You are a forensic logic validator. Evaluate the following generated detective mystery for logical soundness and fair-play solvability.

CASE DATA:
${JSON.stringify(caseData, null, 2)}

EVALUATION CHECKLIST:
1. Is the culprit clearly identified in the solution and present in the suspects list?
2. Do the decisive clues (non-red herrings) logically converge on the identified culprit WITHOUT relying on unstated assumptions?
3. Are the red herrings plausible yet distinguishable through careful deduction?
4. Does any clue contradict the stated solution?

Return ONLY raw valid JSON conforming to this schema without markdown fences:
{
  "isSolvable": true | false,
  "confidenceScore": 0.0 to 1.0,
  "critique": "Brief explanation of logical consistency or identified flaw",
  "recommendedFixes": "Specific instructions on what to fix if isSolvable is false"
}`;
};
