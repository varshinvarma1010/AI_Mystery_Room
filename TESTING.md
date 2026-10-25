# TESTING.md — AI Mystery Room Verification & Test Plan

This document details the test suites and manual verification checklists mapped directly to the core and advanced acceptance criteria.

---

## 1. Acceptance Criteria Mapping

| ID | Criterion | Verification Method | Status |
|---|---|---|---|
| **AC-1** | Case Generation at all 3 difficulty tiers (Easy: 3/5/2, Medium: 4/7/3, Hard: 5/9/3) | Automated Zod schema validation & prompt matrix (`server/src/prompts/caseGenerationPrompt.js`) | ✅ Implemented |
| **AC-2** | Zero-leak guarantee: `solution`, `isCulprit`, `privateProfile`, `isRedHerring` never exposed on `GET /api/cases/:id` | Automated unit test (`server/tests/noLeak.test.js`) | ✅ Implemented |
| **AC-3** | Clue discovery (+5 pts) and progressive hints (-10 pts) enforce backend rules | Automated test + Controller endpoints (`discoverClue`, `requestHint`) | ✅ Implemented |
| **AC-4** | Accusation validation & authoritative score computation with breakdown | Automated unit test (`server/tests/scoring.test.js`) | ✅ Implemented |
| **AC-5** | `GET /api/cases/:id/result` returns 403 Forbidden until an accusation is logged | Security assertion in `server/src/controllers/caseController.js` | ✅ Implemented |
| **AC-6** | Interrogation endpoint enforces question allowance and charges -2 pts | Express controller check in `interrogateSuspect` | ✅ Implemented |
| **AC-7** | Suspect contradiction detection awards +10 or charges -5 penalty | Dedicated endpoint `POST /api/cases/:id/contradictions` | ✅ Implemented |
| **AC-8** | Corkboard persistence (nodes, red strings) saves and reloads correctly | Tested with `PUT /api/cases/:id/board` + `EvidenceCorkboard.jsx` | ✅ Implemented |
| **AC-9** | Responsive UI works across mobile, tablet, and desktop viewports | Tailwind CSS grid & flex layout across all 8 pages | ✅ Implemented |
| **AC-10**| Graceful fallback when Gemini API fails or rate-limits | Tested with `generateMockMysteryCase` in `server/src/data/mockCase.js` | ✅ Implemented |

---

## 2. Automated Test Commands
Run the automated test suite directly using Node's built-in test runner:
```bash
cd server
npm test
```
The suite executes:
- `tests/scoring.test.js`: Validates all point rules, penalties, and detective tiers.
- `tests/noLeak.test.js`: Proves that active case DTOs never expose private solution fields.
- `tests/sanitizer.test.js`: Verifies prompt injection stripping and premise sanitization.

---

## 3. Manual Live Demonstration Script
Follow this test workflow when demonstrating the live application:
1. Open the app at `/`. Verify atmospheric theme and Web Audio rain toggle.
2. Click **New Case** (`/create`).
3. Select Theme: **Noir**, Difficulty: **Medium**, Premise: *"A rare diamond vanished during a blackout at the Blackwood Manor."*
4. Click **Initialize Investigation Room**. Verify typewriter loader displays progressive generation stages.
5. In **Investigation Room**:
   - Inspect Suspect Dossiers.
   - Click **Interrogate Suspect** on Arthur Sterling, ask an alibi question, observe the response and verify question count decrements.
   - Go to **Evidence Locker**: Discover 2 clues, verify score increases by +10.
   - Request a Hint: Observe progressive hint reveal and score deduction (-10).
   - Go to **Evidence Corkboard**: Pin a suspect and a clue, click both cards to tie a red yarn string, and add a note. Click Save Board.
   - Click **Flag Contradiction**: Pair suspect with conflicting clue for +10 points.
6. Click **Make Accusation**:
   - Select suspect, motive, method, and 2 supporting clues.
   - Type deduction reasoning and submit.
7. Verify **Results Page**:
   - Inspect score breakdown, verdict badge, and Gemini Detective Review.
   - Click **View Shareable Case File Dossier** to view the public certificate view.
