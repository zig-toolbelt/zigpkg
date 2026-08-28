export type GlossaryEntry = {
  token: string;
  meaning: string;
};

export type OrderingItem = {
  id: string;
  label: string;
  hint: string;
};

export type OrderingChallenge = {
  kind: "ordering";
  prompt: string;
  items: OrderingItem[];
  correctOrder: string[];
  explanation: string;
};

export type BlankOption = {
  value: string;
  feedback: string;
};

export type Blank = {
  id: string;
  label: string;
  options: BlankOption[];
  answer: string;
};

export type CodeSegment = { type: "text"; value: string } | ({ type: "blank" } & Blank);

export type FillBlankChallenge = {
  kind: "fill-blank";
  prompt: string;
  segments: CodeSegment[];
  explanation: string;
};

export type TimelineLine = {
  id: string;
  text: string;
  explain: string;
};

export type TimelineChallenge = {
  kind: "timeline";
  prompt: string;
  code: string;
  lines: TimelineLine[];
  timestamps: string[];
  correct: Record<string, string>;
  totalSeconds: number;
  totalOptions: number[];
  totalExplain: string;
  explanation: string;
};

export type ChoiceOption = {
  id: string;
  label: string;
  feedback: string;
};

export type ChoiceFixOption = {
  id: string;
  code: string;
  feedback: string;
};

export type ChoiceFix = {
  prompt: string;
  options: ChoiceFixOption[];
  correct: string;
  explanation: string;
};

export type ChoiceChallenge = {
  kind: "choice";
  prompt: string;
  options: ChoiceOption[];
  correct: string;
  explanation: string;
  fix?: ChoiceFix;
};

export type Challenge =
  | OrderingChallenge
  | FillBlankChallenge
  | TimelineChallenge
  | ChoiceChallenge;

export type Level = {
  id: number;
  codename: string;
  title: string;
  story: string;
  concept: string;
  glossary: GlossaryEntry[];
  referenceCode?: string;
  challenge: Challenge;
  reward: number;
  takeaway: string;
};

export type LevelResult = {
  id: number;
  earned: number;
  reward: number;
  mistakes: number;
};

export type Rank = {
  title: string;
  badge: string;
  verdict: string;
};

export type SchoolCopy = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lead: string;
    audience: string;
    audienceLead: string;
    tags: string[];
  };
  skills: string[];
  start: {
    begin: string;
    resume: string;
    restart: string;
    saved: string;
    mapTitle: string;
    storageNote: string;
  };
  shell: {
    exit: string;
    xp: string;
    soundOn: string;
    soundOff: string;
  };
  level: {
    mission: string;
    briefing: string;
    concept: string;
    syntax: string;
    sample: string;
    toChallenge: string;
    backToBriefing: string;
    missionClear: string;
    perfect: string;
    partial: string;
    learned: string;
    nextMission: string;
    toDebrief: string;
  };
  challenge: {
    task: string;
    diagnosis: string;
    fix: string;
    reward: string;
    heartsHint: string;
    rewardHint: string;
    check: string;
    tryAgain: string;
    reveal: string;
    giveUp: string;
    next: string;
    toFix: string;
    enterHint: string;
    orderingBank: string;
    orderingEmpty: string;
    orderingRetryHint: string;
    fillBankLabel: string;
    timelineBank: string;
    timelineTotal: string;
    seconds: string;
    totalRow: string;
    fixOption: string;
  };
  feedback: {
    wrongOrder: string;
    wrongOrderAgain: string;
    correctOrder: string;
    perfectOrder: string;
    revealOrder: string;
    wrongBlanks: string;
    wrongBlanksAgain: string;
    correctBlanks: string;
    perfectBlanks: string;
    revealBlanks: string;
    wrongTimeline: string;
    wrongTimelineAgain: string;
    correctTimeline: string;
    perfectTimeline: string;
    revealTimeline: string;
    wrongChoice: string;
    wrongChoiceAgain: string;
    correctChoice: string;
    correctFix: string;
    revealChoice: string;
  };
  completion: {
    eyebrow: string;
    of: string;
    mastery: string;
    cleanRuns: string;
    log: string;
    concepts: string;
    epilogue: string;
    replay: string;
    menu: string;
    replayHint: string;
    noMistakes: string;
    oneMistake: string;
    manyMistakes: string;
    maxedMistakes: string;
  };
  ranks: Rank[];
};

export type SchoolContent = {
  copy: SchoolCopy;
  levels: Level[];
};
