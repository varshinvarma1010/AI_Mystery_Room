import { z } from 'zod';

export const createCaseSchema = z.object({
  premise: z.string().min(5, 'Premise must be at least 5 characters').max(350),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  theme: z.enum(['noir', 'cozy', 'scifi', 'victorian', 'cyberpunk']).default('noir'),
  playerId: z.string().optional().default(() => `player_${Date.now()}`),
  nickname: z.string().max(30).optional().default('Detective')
});

export const discoverClueSchema = z.object({
  clueId: z.string().min(1, 'clueId is required')
});

export const interrogateSchema = z.object({
  suspectId: z.string().min(1, 'suspectId is required'),
  question: z.string().min(2, 'Question must be at least 2 characters').max(250)
});

export const flagContradictionSchema = z.object({
  suspectId: z.string().min(1, 'suspectId is required'),
  clueId: z.string().min(1, 'clueId is required'),
  statement: z.string().min(1, 'Statement text is required')
});

export const updateBoardSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    type: z.enum(['suspect', 'clue', 'note']),
    refId: z.string().optional(),
    x: z.number(),
    y: z.number(),
    text: z.string().optional()
  })),
  connections: z.array(z.object({
    fromNodeId: z.string(),
    toNodeId: z.string(),
    label: z.string().optional()
  }))
});

export const updateNotebookSchema = z.object({
  notebook: z.string().max(5000)
});

export const accuseSchema = z.object({
  culpritId: z.string().min(1, 'Culprit selection is required'),
  motive: z.string().min(1, 'Motive is required'),
  method: z.string().min(1, 'Method is required'),
  supportingClueIds: z.array(z.string()).min(1, 'Select at least 1 supporting clue').max(3, 'Select up to 3 supporting clues'),
  reasoning: z.string().min(5, 'Please provide your deduction reasoning').max(1000),
  timeRemainingSeconds: z.number().optional().default(0)
});
