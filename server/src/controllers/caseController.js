import mongoose from 'mongoose';
import { Case } from '../models/Case.js';
import { 
  createCaseSchema, 
  updateBoardSchema, 
  updateNotebookSchema,
  interrogateSchema,
  flagContradictionSchema,
  accuseSchema
} from '../validators/caseValidators.js';
import { serializeCaseForPlayer, serializeCaseResult } from '../utils/serializers.js';
import { sanitizePremise, sanitizeQuestion } from '../utils/sanitizers.js';
import { 
  generateMysteryCase, 
  interrogateSuspectWithGemini, 
  generateDetectiveCritique 
} from '../services/geminiService.js';
import { generateMockMysteryCase } from '../data/mockCase.js';
import { calculateCaseScore } from '../utils/scoringEngine.js';

// In-memory fallback store for transient cases or when MongoDB is connecting
const transientStore = new Map();

/**
 * Universal safe Case finder that handles both MongoDB ObjectIds and transient in-memory cases
 */
const findCaseDocument = async (id, secretProjection = '') => {
  if (!id) return null;
  const idStr = id.toString();

  // Check in-memory store first
  if (transientStore.has(idStr)) {
    const doc = transientStore.get(idStr);
    if (!doc.save) {
      doc.save = async function() {
        transientStore.set(idStr, this);
        return this;
      };
    }
    return doc;
  }

  // Handle transient session strings without calling Mongoose findById
  if (idStr.startsWith('transient_')) {
    const fallbackCase = generateMockMysteryCase('medium', 'noir');
    fallbackCase._id = idStr;
    fallbackCase.save = async function() {
      transientStore.set(idStr, this);
      return this;
    };
    transientStore.set(idStr, fallbackCase);
    return fallbackCase;
  }

  // Safely query MongoDB if connection is ready and ID is a valid 24-hex ObjectId
  if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(id)) {
    try {
      return await Case.findById(id).select(secretProjection);
    } catch (err) {
      console.warn('Mongoose query error:', err.message);
      return null;
    }
  }

  return null;
};

/**
 * POST /api/cases
 * Generates and stores a new mystery case
 */
export const createCase = async (req, res, next) => {
  try {
    const validatedData = createCaseSchema.parse(req.body);
    const sanitizedInputPremise = sanitizePremise(validatedData.premise);

    let caseData;
    try {
      caseData = await generateMysteryCase({
        premise: sanitizedInputPremise,
        difficulty: validatedData.difficulty,
        theme: validatedData.theme
      });
    } catch (aiErr) {
      console.warn('⚠️ Gemini generation error, falling back to rich mock mystery case:', aiErr.message);
      caseData = generateMockMysteryCase(validatedData.difficulty, validatedData.theme, sanitizedInputPremise);
    }

    caseData.playerId = validatedData.playerId;
    caseData.nickname = validatedData.nickname;

    let savedCase;
    try {
      if (mongoose.connection.readyState === 1) {
        savedCase = await Case.create(caseData);
      } else {
        throw new Error('Database disconnected or buffering');
      }
    } catch (dbErr) {
      console.warn('⚠️ MongoDB detached, serving in-memory case instance:', dbErr.message);
      const generatedId = new mongoose.Types.ObjectId().toString();
      caseData._id = generatedId;
      caseData.save = async function() {
        transientStore.set(generatedId, this);
        return this;
      };
      transientStore.set(generatedId, caseData);
      savedCase = caseData;
    }

    const safeDto = serializeCaseForPlayer(savedCase);
    res.status(201).json(safeDto);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cases/:id
 * Retrieves an active case. STRICT ANTI-LEAK: Solution is stripped.
 */
export const getCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundCase = await findCaseDocument(id);

    if (!foundCase) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (foundCase.status === 'completed') {
      return res.status(200).json(serializeCaseResult(foundCase));
    }

    return res.status(200).json(serializeCaseForPlayer(foundCase));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cases/:id/clues/:clueId/discover
 * Discovers a clue, unlocks its full text, and records +5 points
 */
export const discoverClue = async (req, res, next) => {
  try {
    const { id, clueId } = req.params;
    const caseDoc = await findCaseDocument(id);

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (caseDoc.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed' });
    }

    const clue = (caseDoc.clues || []).find((c) => c.id === clueId);
    if (!clue) {
      return res.status(404).json({ error: 'Clue not found' });
    }

    if (!clue.discovered) {
      clue.discovered = true;
      clue.discoveredAt = new Date();
      if (!caseDoc.progress.discoveredClueIds) {
        caseDoc.progress.discoveredClueIds = [];
      }
      if (!caseDoc.progress.discoveredClueIds.includes(clueId)) {
        caseDoc.progress.discoveredClueIds.push(clueId);
      }
      if (!caseDoc.score) caseDoc.score = {};
      caseDoc.score.cluesDiscoveredPoints = caseDoc.progress.discoveredClueIds.length * 5;
      await caseDoc.save();
    }

    res.status(200).json({
      success: true,
      clue: {
        id: clue.id,
        title: clue.title,
        text: clue.text,
        location: clue.location,
        category: clue.category,
        discovered: true
      },
      discoveredClueIds: caseDoc.progress.discoveredClueIds,
      cluesDiscoveredPoints: caseDoc.score?.cluesDiscoveredPoints || 0
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cases/:id/hints
 * Unlocks the next progressive hint (-10 points)
 */
export const requestHint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseDoc = await findCaseDocument(id);

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (caseDoc.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed' });
    }

    const nextHint = (caseDoc.hints || []).find((h) => !h.used);
    if (!nextHint) {
      return res.status(400).json({ error: 'No more hints available for this case' });
    }

    nextHint.used = true;
    nextHint.usedAt = new Date();
    if (!caseDoc.progress) caseDoc.progress = {};
    caseDoc.progress.hintsUsed = (caseDoc.progress.hintsUsed || 0) + 1;
    if (!caseDoc.score) caseDoc.score = {};
    caseDoc.score.hintsPenalty = caseDoc.progress.hintsUsed * 10;
    await caseDoc.save();

    res.status(200).json({
      success: true,
      hint: {
        level: nextHint.level,
        text: nextHint.text,
        used: true
      },
      hintsUsed: caseDoc.progress.hintsUsed,
      hintsPenalty: caseDoc.score.hintsPenalty
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cases/:id/interrogate
 * Submits a question to a suspect, processed by Gemini roleplay
 */
export const interrogateSuspect = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspectId, question } = interrogateSchema.parse(req.body);
    const sanitizedQ = sanitizeQuestion(question);

    // Fetch case WITH sensitive privateProfile included for the AI
    const caseDoc = await findCaseDocument(id, '+suspects.privateProfile +solution');
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (caseDoc.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed' });
    }

    // Check question allowance
    const maxAllowed = caseDoc.progress?.maxQuestions || 8;
    const currentAsked = caseDoc.progress?.questionsAsked || 0;
    if (currentAsked >= maxAllowed) {
      return res.status(400).json({ 
        error: `Question limit reached (${maxAllowed} max). Make your accusation or review existing evidence.` 
      });
    }

    const suspect = (caseDoc.suspects || []).find((s) => s.id === suspectId);
    if (!suspect) {
      return res.status(404).json({ error: 'Suspect not found' });
    }

    // Get previous conversation history with this suspect
    const conversationHistory = (caseDoc.interrogationLog || []).filter(
      (m) => m.suspectId === suspectId
    );

    let suspectReply;
    try {
      suspectReply = await interrogateSuspectWithGemini({
        suspect,
        caseStory: caseDoc.story,
        conversationHistory,
        playerQuestion: sanitizedQ
      });
    } catch (aiErr) {
      // In-character fallback if API is unavailable or rate-limited
      suspectReply = `${suspect.name} straightens their jacket defensively: "Detective, I have already told you my alibi. I was nowhere near the scene, and you're wasting valuable time questioning an innocent person."`;
    }

    // Log dialogue and update costs
    if (!caseDoc.interrogationLog) caseDoc.interrogationLog = [];
    caseDoc.interrogationLog.push({
      suspectId,
      sender: 'player',
      message: sanitizedQ,
      timestamp: new Date()
    });
    caseDoc.interrogationLog.push({
      suspectId,
      sender: 'suspect',
      message: suspectReply,
      timestamp: new Date()
    });

    if (!caseDoc.progress) caseDoc.progress = {};
    caseDoc.progress.questionsAsked = currentAsked + 1;
    if (!caseDoc.score) caseDoc.score = {};
    caseDoc.score.questionsPenalty = caseDoc.progress.questionsAsked * 2;
    await caseDoc.save();

    res.status(200).json({
      success: true,
      suspectReply,
      questionsAsked: caseDoc.progress.questionsAsked,
      questionsRemaining: maxAllowed - caseDoc.progress.questionsAsked,
      questionsPenalty: caseDoc.score.questionsPenalty
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cases/:id/contradictions
 * Flags a contradiction between a suspect's statement and physical clue (+10 or -5 pts)
 */
export const flagContradiction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { suspectId, clueId, statement } = flagContradictionSchema.parse(req.body);

    const caseDoc = await findCaseDocument(id, '+solution');
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (caseDoc.status === 'completed') {
      return res.status(400).json({ error: 'Case is already closed' });
    }

    const targetContradiction = caseDoc.solution?.contradiction;
    const isValid = Boolean(
      targetContradiction &&
      targetContradiction.suspectId === suspectId &&
      targetContradiction.clueId === clueId
    );

    if (!caseDoc.progress) caseDoc.progress = {};
    if (!caseDoc.progress.contradictionsFlagged) caseDoc.progress.contradictionsFlagged = [];
    caseDoc.progress.contradictionsFlagged.push({
      suspectId,
      clueId,
      isValid,
      timestamp: new Date()
    });

    // Update contradiction points (+10 for valid, -5 for invalid)
    const validCount = caseDoc.progress.contradictionsFlagged.filter((c) => c.isValid).length;
    const invalidCount = caseDoc.progress.contradictionsFlagged.filter((c) => !c.isValid).length;
    if (!caseDoc.score) caseDoc.score = {};
    caseDoc.score.contradictionPoints = (validCount * 10) - (invalidCount * 5);
    await caseDoc.save();

    res.status(200).json({
      success: true,
      isValid,
      message: isValid
        ? 'Contradiction confirmed! You shattered the suspect’s facade (+10 points).'
        : 'False contradiction. The evidence does not logically refute this claim (-5 points).',
      explanation: isValid ? targetContradiction.explanation : null,
      contradictionPoints: caseDoc.score.contradictionPoints
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/cases/:id/accuse
 * Submits final accusation, computes score, calls Gemini for critique, and closes case
 */
export const submitAccusation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedAccusation = accuseSchema.parse(req.body);

    const caseDoc = await findCaseDocument(id, '+solution +clues.isRedHerring');
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }
    if (caseDoc.status === 'completed') {
      return res.status(400).json({ error: 'Accusation already submitted for this case' });
    }

    const solution = caseDoc.solution || {
      culpritId: caseDoc.suspects[0]?.id,
      motive: 'Greed',
      method: 'Direct theft',
      explanation: 'The culprit stole the item.',
      decisiveClueIds: [caseDoc.clues[0]?.id]
    };

    const isCorrectCulprit = solution.culpritId === validatedAccusation.culpritId;
    
    // Fuzzy matching for motive and method
    const isCorrectMotive = isCorrectCulprit && (
      validatedAccusation.motive.toLowerCase().includes((solution.motive || '').toLowerCase()) ||
      (solution.motive || '').toLowerCase().includes(validatedAccusation.motive.toLowerCase())
    );
    const isCorrectMethod = isCorrectCulprit && (
      validatedAccusation.method.toLowerCase().includes((solution.method || '').toLowerCase()) ||
      (solution.method || '').toLowerCase().includes(validatedAccusation.method.toLowerCase())
    );

    const redHerringClueIds = (caseDoc.clues || [])
      .filter((c) => c.isRedHerring)
      .map((c) => c.id);

    const validContradictionsCount = (caseDoc.progress?.contradictionsFlagged || []).filter((c) => c.isValid).length;
    const invalidContradictionsCount = (caseDoc.progress?.contradictionsFlagged || []).filter((c) => !c.isValid).length;

    // Authoritative backend score computation
    const scoreBreakdown = calculateCaseScore({
      difficulty: caseDoc.difficulty,
      isCorrectCulprit,
      isCorrectMotive,
      isCorrectMethod,
      chosenSupportingClueIds: validatedAccusation.supportingClueIds,
      decisiveClueIds: solution.decisiveClueIds || [],
      redHerringClueIds,
      discoveredCluesCount: caseDoc.progress?.discoveredClueIds?.length || 0,
      hintsUsedCount: caseDoc.progress?.hintsUsed || 0,
      questionsAskedCount: caseDoc.progress?.questionsAsked || 0,
      validContradictionsCount,
      invalidContradictionsCount,
      timeRemainingSeconds: validatedAccusation.timeRemainingSeconds || 0
    });

    // Generate AI Detective Review
    const critique = await generateDetectiveCritique({
      caseData: caseDoc,
      accusation: validatedAccusation,
      isCorrect: isCorrectCulprit
    });

    // Finalize case
    caseDoc.accusation = {
      ...validatedAccusation,
      submittedAt: new Date()
    };
    caseDoc.score = scoreBreakdown;
    caseDoc.detectiveCritique = critique;
    caseDoc.status = 'completed';
    if (!caseDoc.progress) caseDoc.progress = {};
    caseDoc.progress.completedAt = new Date();

    await caseDoc.save();

    res.status(200).json(serializeCaseResult(caseDoc));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cases/:id/result
 * STRICT SECURITY: Only accessible when status is 'completed'. Else 403 Forbidden.
 */
export const getCaseResult = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseDoc = await findCaseDocument(id, '+solution +clues.isRedHerring');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    if (caseDoc.status !== 'completed') {
      return res.status(403).json({
        error: 'Forbidden: Case investigation is still ongoing. Submit an accusation to unlock the final case result.'
      });
    }

    res.status(200).json(serializeCaseResult(caseDoc));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cases/:id/file
 * Public shareable case file dossier
 */
export const getCaseFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const caseDoc = await findCaseDocument(id, '+solution +clues.isRedHerring');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case file not found' });
    }

    if (caseDoc.status !== 'completed') {
      return res.status(403).json({ error: 'Case file cannot be shared while investigation is ongoing.' });
    }

    res.status(200).json(serializeCaseResult(caseDoc));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cases/daily
 */
export const getDailyCase = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    let dailyCase = null;
    if (mongoose.connection.readyState === 1) {
      dailyCase = await Case.findOne({ isDaily: true, dailyDateString: todayStr });
    }

    if (!dailyCase) {
      const dailyPremise = `The Midnight Vault incident: An emerald watch vanished during the Grand Masquerade on ${todayStr}.`;
      let caseData;
      try {
        caseData = await generateMysteryCase({ premise: dailyPremise, difficulty: 'medium', theme: 'victorian' });
      } catch (err) {
        caseData = generateMockMysteryCase('medium', 'victorian', dailyPremise);
      }
      caseData.isDaily = true;
      caseData.dailyDateString = todayStr;
      caseData.title = `Daily Mystery: ${todayStr}`;
      
      if (mongoose.connection.readyState === 1) {
        dailyCase = await Case.create(caseData);
      } else {
        const id = new mongoose.Types.ObjectId().toString();
        caseData._id = id;
        caseData.save = async function() {
          transientStore.set(id, this);
          return this;
        };
        transientStore.set(id, caseData);
        dailyCase = caseData;
      }
    }

    res.status(200).json(serializeCaseForPlayer(dailyCase));
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cases/:id/board
 */
export const updateBoard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nodes, connections } = updateBoardSchema.parse(req.body);

    const caseDoc = await findCaseDocument(id);
    if (caseDoc) {
      if (!caseDoc.progress) caseDoc.progress = {};
      caseDoc.progress.boardState = { nodes, connections };
      await caseDoc.save();
    }

    res.status(200).json({ success: true, boardState: caseDoc?.progress?.boardState || { nodes, connections } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/cases/:id/notebook
 */
export const updateNotebook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notebook } = updateNotebookSchema.parse(req.body);

    const caseDoc = await findCaseDocument(id);
    if (caseDoc) {
      if (!caseDoc.progress) caseDoc.progress = {};
      caseDoc.progress.notebook = notebook;
      await caseDoc.save();
    }

    res.status(200).json({ success: true, notebook: caseDoc?.progress?.notebook || notebook });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/leaderboard
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const difficulty = req.query.difficulty || 'medium';
    let topCases = [];
    if (mongoose.connection.readyState === 1) {
      topCases = await Case.find({ status: 'completed', difficulty })
        .sort({ 'score.total': -1, 'progress.completedAt': 1 })
        .limit(10)
        .select('title nickname theme difficulty score createdAt');
    }

    res.status(200).json({ difficulty, leaderboard: topCases });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/cases/history/:playerId
 */
export const getPlayerHistory = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    let cases = [];
    if (mongoose.connection.readyState === 1) {
      cases = await Case.find({ playerId })
        .sort({ createdAt: -1 })
        .select('title difficulty theme status score createdAt');
    }

    res.status(200).json({ cases });
  } catch (err) {
    next(err);
  }
};
