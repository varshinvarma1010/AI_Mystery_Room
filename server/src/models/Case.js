import mongoose from 'mongoose';

const SuspectSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String, default: 'detective-suspect' },
  publicBio: { type: String, required: true },
  // Sensitive field: Never exposed directly in queries by default
  privateProfile: {
    type: {
      alibi: String,
      actualActions: String,
      secrets: String,
      motiveSummary: String,
      temperament: String
    },
    select: false
  }
}, { _id: false });

const ClueSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
  location: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['physical', 'document', 'testimony', 'timeline'], 
    default: 'physical' 
  },
  // Sensitive fields: Hidden from player
  isRedHerring: { type: Boolean, default: false, select: false },
  pointsTo: { type: String, select: false },
  discovered: { type: Boolean, default: false },
  discoveredAt: { type: Date }
}, { _id: false });

const HintSchema = new mongoose.Schema({
  level: { type: Number, required: true, min: 1, max: 3 },
  text: { type: String, required: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date }
}, { _id: false });

const SolutionSchema = new mongoose.Schema({
  culpritId: { type: String, required: true },
  motive: { type: String, required: true },
  method: { type: String, required: true },
  explanation: { type: String, required: true },
  decisiveClueIds: [{ type: String }],
  contradiction: {
    suspectId: String,
    statementKey: String,
    clueId: String,
    explanation: String
  }
}, { _id: false, select: false });

const CorkboardNodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['suspect', 'clue', 'note'], required: true },
  refId: { type: String },
  x: { type: Number, default: 100 },
  y: { type: Number, default: 100 },
  text: { type: String, default: '' }
}, { _id: false });

const CorkboardConnectionSchema = new mongoose.Schema({
  fromNodeId: { type: String, required: true },
  toNodeId: { type: String, required: true },
  label: { type: String, default: '' }
}, { _id: false });

const InterrogationMessageSchema = new mongoose.Schema({
  suspectId: { type: String, required: true },
  sender: { type: String, enum: ['player', 'suspect'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  theme: { 
    type: String, 
    enum: ['noir', 'cozy', 'scifi', 'victorian', 'cyberpunk'], 
    default: 'noir' 
  },
  premise: { type: String, required: true, trim: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'], 
    required: true 
  },
  story: { type: String, required: true },
  suspects: [SuspectSchema],
  clues: [ClueSchema],
  hints: [HintSchema],
  // Solution is hidden by default at the root schema level
  solution: { type: SolutionSchema, select: false },
  
  progress: {
    discoveredClueIds: [{ type: String }],
    hintsUsed: { type: Number, default: 0 },
    questionsAsked: { type: Number, default: 0 },
    maxQuestions: { type: Number, default: 8 },
    contradictionsFlagged: [{
      suspectId: String,
      clueId: String,
      isValid: Boolean,
      timestamp: { type: Date, default: Date.now }
    }],
    boardState: {
      nodes: [CorkboardNodeSchema],
      connections: [CorkboardConnectionSchema]
    },
    notebook: { type: String, default: '' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },

  interrogationLog: [InterrogationMessageSchema],

  accusation: {
    culpritId: { type: String },
    motive: { type: String },
    method: { type: String },
    supportingClueIds: [{ type: String }],
    reasoning: { type: String },
    submittedAt: { type: Date }
  },

  score: {
    baseAccusation: { type: Number, default: 0 },
    motiveBonus: { type: Number, default: 0 },
    methodBonus: { type: Number, default: 0 },
    supportingCluesBonus: { type: Number, default: 0 },
    cluesDiscoveredPoints: { type: Number, default: 0 },
    hintsPenalty: { type: Number, default: 0 },
    questionsPenalty: { type: Number, default: 0 },
    contradictionPoints: { type: Number, default: 0 },
    timeBonus: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    tier: { 
      type: String, 
      enum: ['Master Detective', 'Sharp Eye', 'Close Call', 'Case Cold', 'Pending'],
      default: 'Pending'
    }
  },

  detectiveCritique: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'completed'], 
    default: 'active' 
  },
  playerId: { type: String, index: true },
  nickname: { type: String, default: 'Detective' },
  isDaily: { type: Boolean, default: false },
  dailyDateString: { type: String }, // e.g., '2026-10-25'
  createdAt: { type: Date, default: Date.now }
});

// Compound indexes for leaderboard and player lookups
CaseSchema.index({ difficulty: 1, 'score.total': -1, status: 1 });
CaseSchema.index({ isDaily: 1, dailyDateString: 1 });
CaseSchema.index({ playerId: 1, createdAt: -1 });

export const Case = mongoose.model('Case', CaseSchema);
