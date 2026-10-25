import { env } from '../config/env.js';
import { buildCaseGenerationPrompt } from '../prompts/caseGenerationPrompt.js';
import { buildSolvabilityPrompt } from '../prompts/solvabilityPrompt.js';
import { buildInterrogationPrompt } from '../prompts/interrogationPrompt.js';
import { buildCritiquePrompt } from '../prompts/critiquePrompt.js';

let aiClient = null;

const getAIClient = async () => {
  if (!aiClient) {
    if (!env.GEMINI_API_KEY || env.GEMINI_API_KEY === 'dummy_gemini_key') {
      throw new Error('GEMINI_API_KEY is not configured in server/.env');
    }
    try {
      const { GoogleGenAI } = await import('@google/genai');
      aiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    } catch (err) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        aiClient = {
          models: {
            generateContent: async ({ model, contents, config }) => {
              const m = genAI.getGenerativeModel({
                model,
                generationConfig: {
                  responseMimeType: config?.responseMimeType,
                  temperature: config?.temperature,
                  maxOutputTokens: config?.maxOutputTokens
                }
              });
              const res = await m.generateContent(contents);
              return { text: res.response.text() };
            }
          }
        };
      } catch (err2) {
        throw new Error('Neither @google/genai nor @google/generative-ai is available.');
      }
    }
  }
  return aiClient;
};

/**
 * Safely parses JSON response from Gemini, removing accidental markdown fences if any
 */
const parseGeminiJSON = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
};

/**
 * Generates a full mystery case with Dual-Pass AI verification
 */
export const generateMysteryCase = async ({ premise, difficulty, theme }) => {
  const ai = await getAIClient();
  const maxRetries = 2;
  let attempt = 0;
  let correctiveFeedback = '';

  while (attempt <= maxRetries) {
    attempt++;
    let prompt = buildCaseGenerationPrompt({ premise, difficulty, theme });
    if (correctiveFeedback) {
      prompt += `\n\nPREVIOUS GENERATION FLAW (CORRECT THIS IN THIS RUN):\n${correctiveFeedback}`;
    }

    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8
      }
    });

    const parsedCase = parseGeminiJSON(response.text);

    // Validate counts according to difficulty
    const expected = {
      easy: { suspects: 3, clues: 5, hints: 2 },
      medium: { suspects: 4, clues: 7, hints: 3 },
      hard: { suspects: 5, clues: 9, hints: 3 }
    }[difficulty] || { suspects: 4, clues: 7, hints: 3 };

    if (
      parsedCase.suspects.length !== expected.suspects ||
      parsedCase.clues.length !== expected.clues ||
      parsedCase.hints.length !== expected.hints
    ) {
      correctiveFeedback = `Count mismatch. Expected ${expected.suspects} suspects, ${expected.clues} clues, and ${expected.hints} hints.`;
      continue;
    }

    // Verify culprit exists in suspects list
    const culpritExists = parsedCase.suspects.some((s) => s.id === parsedCase.solution?.culpritId);
    if (!culpritExists) {
      correctiveFeedback = `Culprit ID "${parsedCase.solution?.culpritId}" was not found in suspects list.`;
      continue;
    }

    // Pass 2: Solvability & Consistency Check
    try {
      const solvabilityPrompt = buildSolvabilityPrompt(parsedCase);
      const solvabilityResponse = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: solvabilityPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      const checkResult = parseGeminiJSON(solvabilityResponse.text);

      if (!checkResult.isSolvable && attempt <= maxRetries) {
        correctiveFeedback = `Solvability check failed: ${checkResult.critique}. Fix: ${checkResult.recommendedFixes}`;
        console.warn(`[Pass 2 Solvability Failed - Retrying attempt ${attempt}]:`, checkResult.critique);
        continue;
      }
    } catch (solvErr) {
      console.warn('⚠️ Non-fatal: Pass 2 solvability check skipped or timed out, proceeding with Pass 1 output.');
    }

    // Prepare default game state progress
    const maxQuestions = difficulty === 'easy' ? 6 : (difficulty === 'hard' ? 10 : 8);

    return {
      title: parsedCase.title,
      theme,
      premise,
      difficulty,
      story: parsedCase.story,
      suspects: parsedCase.suspects,
      clues: parsedCase.clues.map((c) => ({
        ...c,
        discovered: false
      })),
      hints: parsedCase.hints.map((h) => ({
        ...h,
        used: false
      })),
      solution: parsedCase.solution,
      progress: {
        discoveredClueIds: [],
        hintsUsed: 0,
        questionsAsked: 0,
        maxQuestions,
        contradictionsFlagged: [],
        boardState: {
          nodes: parsedCase.suspects.slice(0, 2).map((s, idx) => ({
            id: `node_suspect_${s.id}`,
            type: 'suspect',
            refId: s.id,
            x: 80,
            y: 80 + idx * 160,
            text: `${s.name} (${s.role})`
          })),
          connections: []
        },
        notebook: `Case opened. Reviewing evidence for ${parsedCase.title}...`,
        startedAt: new Date()
      },
      interrogationLog: [],
      status: 'active'
    };
  }

  throw new Error('Failed to generate a solvable mystery after retries.');
};

/**
 * Interrogates a suspect using Gemini agent roleplay
 */
export const interrogateSuspectWithGemini = async ({ suspect, caseStory, conversationHistory, playerQuestion }) => {
  const ai = await getAIClient();
  const prompt = buildInterrogationPrompt({
    suspect,
    caseStory,
    conversationHistory,
    playerQuestion
  });

  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: 0.7,
      maxOutputTokens: 250
    }
  });

  return response.text.trim();
};

/**
 * Generates post-game Sherlockian Detective Review
 */
export const generateDetectiveCritique = async ({ caseData, accusation, isCorrect }) => {
  try {
    const ai = await getAIClient();
    const prompt = buildCritiquePrompt({ caseData, accusation, isCorrect });

    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 400
      }
    });

    return response.text.trim();
  } catch (err) {
    console.warn('Could not generate AI critique, using fallback critique:', err.message);
    if (isCorrect) {
      return `Outstanding deduction, Detective! You successfully pieced together the evidence against ${caseData.solution.culpritId} despite the deceptive red herrings. A truly commendable performance.`;
    }
    return `An unfortunate miscalculation. The evidence was obscured by deliberate misdirection, and the true culprit slipped through your fingers. Review the case file to observe where the trail diverged.`;
  }
};
