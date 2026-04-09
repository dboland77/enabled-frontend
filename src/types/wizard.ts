// ----------------------------------------------------------------------
// Adjustment Wizard Types
// ----------------------------------------------------------------------

export type IChallengeItem = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  severity_levels: string[];
  created_at: Date;
  updated_at: Date;
};

export type IChallengeWithSelection = IChallengeItem & {
  selected: boolean;
  severity?: string;
};

export type IDisabilityChallenge = {
  id: string;
  disability_id: string;
  challenge_id: string;
  is_common: boolean;
  notes: string | null;
  created_at: Date;
};

export type IChallengeAdjustment = {
  id: string;
  challenge_id: string;
  adjustment_id: string;
  relevance_score: number;
  notes: string | null;
  created_at: Date;
};

export type IRecommendedAdjustment = {
  id: string;
  title: string;
  category: string;
  description: string;
  relevance_score: number;
  sources: {
    type: 'disability' | 'challenge';
    name: string;
    score: number;
  }[];
  selected: boolean;
};

export type IWizardSession = {
  id: string;
  user_id: string;
  current_step: number;
  selected_disabilities: string[];
  selected_challenges: string[];
  selected_adjustments: string[];
  additional_notes: string | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
};

export type IWizardState = {
  currentStep: number;
  selectedDisabilities: string[];
  selectedChallenges: string[];
  selectedAdjustments: string[];
  additionalNotes: string;
  sessionId: string | null;
};

export type WizardStep = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Disabilities',
    description: 'Select any disabilities that apply to you',
    icon: 'mdi:account-heart',
  },
  {
    id: 2,
    title: 'Challenges',
    description: 'Identify specific functional challenges',
    icon: 'mdi:hand-heart',
  },
  {
    id: 3,
    title: 'Adjustments',
    description: 'Review recommended workplace adjustments',
    icon: 'mdi:lightbulb-on',
  },
  {
    id: 4,
    title: 'Review',
    description: 'Review and submit your request',
    icon: 'mdi:check-circle',
  },
];

// Challenge categories for filtering
export const CHALLENGE_CATEGORIES = [
  'Visual',
  'Hearing',
  'Mobility',
  'Dexterity',
  'Cognitive',
  'Communication',
  'Energy/Fatigue',
  'Pain Management',
  'Mental Health',
  'Other',
] as const;

export type ChallengeCategory = (typeof CHALLENGE_CATEGORIES)[number];
