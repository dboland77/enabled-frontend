export type IDisabilityFilterValue = string | string[];

export type IDisabilityFilters = {
  disability_name: string[];
  disability_nhs_slug: string;
  category: string[];
  subcategory: string[];
};

export type IDisabilityItem = {
  id: string;
  disability_name: string;
  disability_nhs_slug: string | null;
  category: string;
  subcategory: string | null;
  created_at: Date;
  updated_at: Date;
};

export type IDisabilityAdjustment = {
  id: string;
  disability_id: string;
  adjustment_id: string;
  relevance_score: number;
  notes: string | null;
  created_at: Date;
};

export type IAdjustmentWithRelevance = {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  relevance_score: number;
  notes: string | null;
};

export type IDisabilityWithAdjustments = IDisabilityItem & {
  adjustments: IAdjustmentWithRelevance[];
};
