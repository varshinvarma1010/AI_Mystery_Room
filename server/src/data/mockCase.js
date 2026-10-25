export const generateMockMysteryCase = (difficulty = 'medium', theme = 'noir', premise = 'A vintage diamond necklace vanished from Lord Sterling’s locked study.') => {
  const isEasy = difficulty === 'easy';
  const isHard = difficulty === 'hard';

  const suspects = [
    {
      id: 'suspect_1',
      name: 'Arthur Sterling',
      role: 'Nephew & Heir',
      avatar: 'avatar_heir',
      publicBio: 'Impeccably dressed nephew with heavy gaming debts and a strained relationship with the victim.',
      privateProfile: {
        alibi: 'Claims he was in the conservatory smoking cigars between 9:00 PM and 10:00 PM.',
        actualActions: 'Slipped into the study balcony at 9:35 PM after stealing the duplicate brass key.',
        secrets: 'Owes five thousand pounds to a local bookmaker due at midnight.',
        motiveSummary: 'Desperately needed funds to clear his underworld debt before morning.',
        temperament: 'Charming on the surface, easily rattled when pressed about his timeline.'
      }
    },
    {
      id: 'suspect_2',
      name: 'Evelyn Vance',
      role: 'Private Secretary',
      avatar: 'avatar_secretary',
      publicBio: 'Diligent archivist who managed the household accounts and had access to the safe combination.',
      privateProfile: {
        alibi: 'Was filing confidential tax ledgers in the west wing library until 10:30 PM.',
        actualActions: 'Was indeed in the library, but caught Arthur running down the servants staircase at 9:45 PM.',
        secrets: 'Was quietly preparing to resign due to unpaid wages.',
        motiveSummary: 'Bitterness over unpaid bonuses, but strictly law-abiding.',
        temperament: 'Precise, calm, sharp-tongued, defends her ledgers passionately.'
      }
    },
    {
      id: 'suspect_3',
      name: 'Thomas Finch',
      role: 'Head Butler',
      avatar: 'avatar_butler',
      publicBio: 'Served the Sterling estate for 28 years. Holds the master ring of skeleton keys.',
      privateProfile: {
        alibi: 'Was serving brandies in the parlor to guests all evening.',
        actualActions: 'Accidentally misplaced the duplicate brass safe key on the hallway console table at 8:00 PM.',
        secrets: 'Hides a drinking habit and feared losing his pension if negligence was discovered.',
        motiveSummary: 'None; loyal to the estate.',
        temperament: 'Stiff, defensive of his dignity, terrified of scandal.'
      }
    }
  ];

  if (!isEasy) {
    suspects.push({
      id: 'suspect_4',
      name: 'Dr. Julian Croft',
      role: 'Family Physician',
      avatar: 'avatar_doctor',
      publicBio: 'Longtime friend visiting the manor for dinner, carrying his leather medical kit.',
      privateProfile: {
        alibi: 'Was playing chess with Lord Sterling until Lord Sterling retired to the study at 9:15 PM.',
        actualActions: 'Left his pocket watch behind in the parlor and was searching for it with a maid.',
        secrets: 'Was prescribing sleeping powders to Lord Sterling under an assumed name.',
        motiveSummary: 'Professional reputation risks if the prescription was scrutinized.',
        temperament: 'Intellectual, formal, avoids direct eye contact.'
      }
    });
  }

  if (isHard) {
    suspects.push({
      id: 'suspect_5',
      name: 'Cordelia Fox',
      role: 'Art Appraiser',
      avatar: 'avatar_appraiser',
      publicBio: 'Guest cataloging the estate’s jewels and oil paintings for probate.',
      privateProfile: {
        alibi: 'Was in the guest suite examining sketches from 9:00 PM to 10:15 PM.',
        actualActions: 'Heard footsteps on the roof tiles right above her room at 9:40 PM.',
        secrets: 'Had photographed the necklace safe earlier in the afternoon.',
        motiveSummary: 'Knowledge of black-market jewel fences.',
        temperament: 'Shrewd, inquisitive, observes more than she speaks.'
      }
    });
  }

  const clues = [
    {
      id: 'clue_1',
      title: 'Scratched Brass Safe Dial',
      text: 'Fresh micro-scratches circle the safe dial, indicating the lock was opened with a duplicate key rather than forced.',
      location: 'Study Safe',
      category: 'physical',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    },
    {
      id: 'clue_2',
      title: 'Muddy Balcony Footprint',
      text: 'A size-9 oxford shoe footprint pressed into the wet terrace gravel beneath the open study balcony window.',
      location: 'Balcony Terrace',
      category: 'physical',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    },
    {
      id: 'clue_3',
      title: 'Crumpled Bookmaker IOU',
      text: 'A torn slip of paper bearing the watermark of the Blackwood Betting Club demanding 5,000 pounds by midnight.',
      location: 'Conservatory Wastebasket',
      category: 'document',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    },
    {
      id: 'clue_4',
      title: 'Broken Pocket Watch (Stopped at 9:20)',
      text: 'A silver pocket watch found near the dining room sideboard with a cracked face stopped at 9:20 PM.',
      location: 'Dining Room',
      category: 'physical',
      isRedHerring: true, // Red herring! Belongs to Dr. Croft who lost it earlier
      pointsTo: 'suspect_4',
      discovered: false
    },
    {
      id: 'clue_5',
      title: 'Cigar Ash in Flowerpot',
      text: 'Expensive Turkish tobacco ash found near the balcony railing, matching Arthur’s bespoke cigar brand.',
      location: 'Balcony Flowerpot',
      category: 'physical',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    }
  ];

  if (!isEasy) {
    clues.push({
      id: 'clue_6',
      title: 'Smudged Silk Handkerchief',
      text: 'A monogrammed linen handkerchief smelling of lavender and elderflower tonic dropped near the library door.',
      location: 'Library Corridor',
      category: 'document',
      isRedHerring: true, // Red herring pointing to Evelyn
      pointsTo: 'suspect_2',
      discovered: false
    });
    clues.push({
      id: 'clue_7',
      title: 'Servants Staircase Alibi Witness',
      text: 'The pantry log confirms Arthur was seen hurriedly taking the back servants stairs at 9:45 PM holding a velvet pouch.',
      location: 'Servants Pantry Log',
      category: 'timeline',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    });
  }

  if (isHard) {
    clues.push({
      id: 'clue_8',
      title: 'Sleepless Draught Vial',
      text: 'An empty medical vial of chloral hydrate stamped with Dr. Croft’s seal discarded in the parlor hearth.',
      location: 'Parlor Hearth',
      category: 'physical',
      isRedHerring: true, // Red herring
      pointsTo: 'suspect_4',
      discovered: false
    });
    clues.push({
      id: 'clue_9',
      title: 'Torn Velvet Pouch Thread',
      text: 'Crimson velvet fibers matching the jewel safe lining snagged onto Arthur’s dinner jacket cuff button.',
      location: 'Arthur’s Wardrobe',
      category: 'physical',
      isRedHerring: false,
      pointsTo: 'suspect_1',
      discovered: false
    });
  }

  const hints = [
    {
      level: 1,
      text: 'Pay close attention to who had both pressing financial urgency and muddy footwear on a rainy terrace.',
      used: false
    },
    {
      level: 2,
      text: 'The safe was opened cleanly without dynamite or drills. Notice who found or took the duplicate brass key.',
      used: false
    }
  ];

  if (!isEasy) {
    hints.push({
      level: 3,
      text: 'Arthur claimed he never left the conservatory, but the terrace footprint and pantry log directly contradict his alibi.',
      used: false
    });
  }

  const solution = {
    culpritId: 'suspect_1',
    motive: 'Urgent Gambling Debt Default',
    method: 'Balcony Entry with Misplaced Safe Key',
    explanation: 'Arthur Sterling swiped the misplaced brass safe key from the hallway, crept across the balcony terrace at 9:35 PM, cleanly unlocked the wall safe, and took the necklace to settle his gambling debts before midnight.',
    decisiveClueIds: ['clue_1', 'clue_2', 'clue_3', 'clue_5'],
    contradiction: {
      suspectId: 'suspect_1',
      statementKey: 'alibi',
      clueId: 'clue_2',
      explanation: 'Arthur claimed he remained smoking in the conservatory all night, yet his fresh size-9 shoe print was found on the muddy study terrace.'
    }
  };

  const maxQuestions = isEasy ? 6 : (isHard ? 10 : 8);

  return {
    title: 'The Sterling Manor Theft',
    theme,
    premise,
    difficulty,
    story: 'On a stormy autumn evening at Sterling Manor, the priceless heirloom sapphire necklace vanished from Lord Sterling’s private wall safe. The door was locked from the inside, the household was gathered for dinner, and silence masked the thief’s retreat. As the detective on the case, you must dissect the alibis, uncover physical clues, and unmask the culprit before dawn.',
    suspects,
    clues,
    hints,
    solution,
    progress: {
      discoveredClueIds: [],
      hintsUsed: 0,
      questionsAsked: 0,
      maxQuestions,
      contradictionsFlagged: [],
      boardState: {
        nodes: [
          { id: 'node_1', type: 'suspect', refId: 'suspect_1', x: 80, y: 80, text: 'Arthur Sterling (Heir)' },
          { id: 'node_2', type: 'suspect', refId: 'suspect_2', x: 80, y: 260, text: 'Evelyn Vance (Secretary)' }
        ],
        connections: []
      },
      notebook: 'Initial notes: Safe opened cleanly without forced entry. Weather: Raining heavily outside.',
      startedAt: new Date()
    },
    interrogationLog: [],
    status: 'active'
  };
};
