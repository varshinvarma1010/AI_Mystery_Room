/**
 * Builds the Gemini prompt for structured mystery generation
 */
export const buildCaseGenerationPrompt = ({ premise, difficulty, theme }) => {
  const counts = {
    easy: { suspects: 3, clues: 5, redHerrings: 1, hints: 2 },
    medium: { suspects: 4, clues: 7, redHerrings: 2, hints: 3 },
    hard: { suspects: 5, clues: 9, redHerrings: 3, hints: 3 }
  }[difficulty] || { suspects: 4, clues: 7, redHerrings: 2, hints: 3 };

  const themeInstructions = {
    noir: 'Classic 1940s noir detective style, rain-slicked city streets, trench coats, smoky shadows, cynicism, jazz bars.',
    cozy: 'British village cozy mystery, tea rooms, eccentric local characters, quiet gossip, hidden rivalries.',
    scifi: 'Deep space orbital station or Martian colony, cyber-locks, airlocks, android witnesses, tech sabotage.',
    victorian: '19th century gaslamp manor, grand ballrooms, family inheritances, arsenic, pocket watches, velvet curtains.',
    cyberpunk: 'Neo-metropolis, neon rain, neural implants, mega-corp executives, rogue hackers, encrypted datadrives.'
  }[theme] || 'Atmospheric classic mystery';

  return `You are a master mystery writer and detective puzzle architect.
Generate a captivating, intellectually rigorous mystery based on the player's premise.

PREMISE: "${premise}"
GENRE / THEME: ${theme.toUpperCase()} (${themeInstructions})
DIFFICULTY: ${difficulty.toUpperCase()}

STRICT COUNT REQUIREMENTS (DO NOT DEVIATE):
- Suspects: EXACTLY ${counts.suspects} suspects.
- Clues: EXACTLY ${counts.clues} clues in total.
- Red Herrings: EXACTLY ${counts.redHerrings} of the ${counts.clues} clues MUST have "isRedHerring": true.
- Hints: EXACTLY ${counts.hints} progressive hints (Level 1: gentle nudge; Level 2: stronger lead; Level 3: pointed connection).

LOGICAL INTEGRITY & SOLVABILITY RULES:
1. Exactly ONE suspect is the actual culprit ("culpritId").
2. The decisive clues (non-red herrings) must logically and indisputably prove the culprit's guilt, motive, and method when pieced together.
3. The red herring clues must be plausible distractions pointing toward innocent suspects, but contain subtle inconsistencies.
4. Each suspect must have an alibi and at least one hidden secret or personality flaw.
5. Create one distinct CONTRADICTION between a suspect's claimed alibi/statement and a discovered physical clue (e.g. claiming they were asleep while their monogrammed item or footprint was found at the crime scene).

Return ONLY raw valid JSON conforming to this schema without markdown fences:
{
  "title": "A captivating, evocative case title",
  "theme": "${theme}",
  "premise": "${premise}",
  "difficulty": "${difficulty}",
  "story": "Detailed 2-3 paragraph background story setting the scene, victim/incident, and immediate aftermath.",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full Name",
      "role": "Role / Profession",
      "avatar": "avatar_identifier",
      "publicBio": "Publicly known backstory and relation to the case",
      "privateProfile": {
        "alibi": "What they claim they were doing during the crime",
        "actualActions": "What they were REALLY doing",
        "secrets": "Private skeletons or leverage they hide",
        "motiveSummary": "Why someone might suspect them",
        "temperament": "Their demeanor when interrogated (e.g., defensive, arrogant, nervous)"
      }
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Short evocative clue title",
      "text": "Detailed description of the physical evidence, document, or testimony",
      "location": "Room or crime scene location",
      "category": "physical" | "document" | "testimony" | "timeline",
      "isRedHerring": false,
      "pointsTo": "suspect_1"
    }
  ],
  "hints": [
    {
      "level": 1,
      "text": "Progressive hint text"
    }
  ],
  "solution": {
    "culpritId": "suspect_1",
    "motive": "Clear stated motive",
    "method": "Exact method used to commit the crime",
    "explanation": "Detailed explanation of how the evidence proves their guilt",
    "decisiveClueIds": ["clue_1", "clue_2"],
    "contradiction": {
      "suspectId": "suspect_1",
      "statementKey": "alibi",
      "clueId": "clue_2",
      "explanation": "Clear explanation of the factual contradiction"
    }
  }
}`;
};
