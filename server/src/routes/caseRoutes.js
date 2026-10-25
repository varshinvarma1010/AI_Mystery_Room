import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createCase,
  getCaseById,
  getDailyCase,
  discoverClue,
  requestHint,
  interrogateSuspect,
  flagContradiction,
  submitAccusation,
  getCaseResult,
  getCaseFile,
  updateBoard,
  updateNotebook,
  getLeaderboard,
  getPlayerHistory
} from '../controllers/caseController.js';

const router = express.Router();

// Stricter rate limiter for expensive AI case generation (max 10 cases per 15 min per IP)
const createCaseLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many case generation requests. Please investigate existing cases before generating new ones.' }
});

// Stricter rate limiter for interrogation AI calls (max 25 questions per 5 min per IP)
const interrogateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 25,
  message: { error: 'You are interrogating suspects too quickly. Take a moment to review the evidence.' }
});

// Case creation & retrieval
router.post('/cases', createCaseLimiter, createCase);
router.get('/cases/daily', getDailyCase);
router.get('/cases/:id', getCaseById);

// Gameplay actions
router.post('/cases/:id/clues/:clueId/discover', discoverClue);
router.post('/cases/:id/hints', requestHint);
router.post('/cases/:id/interrogate', interrogateLimiter, interrogateSuspect);
router.post('/cases/:id/contradictions', flagContradiction);
router.post('/cases/:id/accuse', submitAccusation);

// Post-game unlocks
router.get('/cases/:id/result', getCaseResult);
router.get('/cases/:id/file', getCaseFile);

// Corkboard & notebook persistence
router.put('/cases/:id/board', updateBoard);
router.put('/cases/:id/notebook', updateNotebook);

// Social & stats
router.get('/leaderboard', getLeaderboard);
router.get('/cases/history/:playerId', getPlayerHistory);

export default router;
