/**
 * Builds the prompt for the post-game Sherlockian Detective Review
 */
export const buildCritiquePrompt = ({ caseData, accusation, isCorrect }) => {
  return `You are a legendary consulting detective reviewing a junior detective's final case submission.

CASE: "${caseData.title}"
TRUE CULPRIT: ${caseData.solution.culpritId}
TRUE MOTIVE: ${caseData.solution.motive}
TRUE METHOD: ${caseData.solution.method}
DECISIVE CLUES: ${caseData.solution.decisiveClueIds.join(', ')}

PLAYER'S ACCUSATION:
- Accused: ${accusation.culpritId} (${isCorrect ? 'CORRECT' : 'WRONG'})
- Player Motive: ${accusation.motive}
- Player Method: ${accusation.method}
- Supporting Clues Selected: ${accusation.supportingClueIds.join(', ')}
- Player Written Reasoning: "${accusation.reasoning}"

TASK:
Write a 2-3 paragraph sharp, atmospheric review of the player's deduction.
1. Declare if their deduction was brilliant, observant, lucky, or misled by red herrings.
2. Highlight which clues were the crucial linchpins and mention any red herrings they fell for or cleverly avoided.
3. Keep the tone engaging, intelligent, and reminiscent of Sherlock Holmes or Hercule Poirot.`;
};
