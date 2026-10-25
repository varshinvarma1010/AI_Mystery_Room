/**
 * Sanitizes user-provided mystery premise and prompts to prevent prompt injection.
 */
export const sanitizePremise = (input) => {
  if (typeof input !== 'string') return 'A mysterious incident at a secluded location';

  // Trim and limit length to 350 chars
  let cleaned = input.trim().slice(0, 350);

  // Strip known injection vectors and system override phrases
  const forbiddenPatterns = [
    /ignore\s+(previous|above|all)\s+instructions?/gi,
    /system\s*prompt/gi,
    /you\s+are\s+now\s+in\s+developer\s+mode/gi,
    /jailbreak/gi,
    /as\s+an\s+ai\s+language\s+model/gi,
    /reveal\s+(the\s+)?(culprit|solution|system)/gi,
    /<\|im_start\|>/gi,
    /<\|im_end\|>/gi,
    /\[INST\]/gi,
    /\[\/INST\]/gi
  ];

  forbiddenPatterns.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, '[REDACTED]');
  });

  // Strip non-printable / dangerous control characters
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

  return cleaned.length > 5 ? cleaned : 'A mysterious incident at a secluded location';
};

/**
 * Sanitizes player interrogation questions
 */
export const sanitizeQuestion = (input) => {
  if (typeof input !== 'string') return '';
  let cleaned = input.trim().slice(0, 250);
  const injectionPatterns = [
    /ignore\s+your\s+role/gi,
    /tell\s+me\s+who\s+(did\s+it|is\s+the\s+killer|is\s+the\s+culprit)/gi,
    /what\s+is\s+your\s+system\s+prompt/gi,
    /are\s+you\s+an\s+ai/gi
  ];
  injectionPatterns.forEach((p) => {
    cleaned = cleaned.replace(p, '[DEFLECT]');
  });
  return cleaned;
};
