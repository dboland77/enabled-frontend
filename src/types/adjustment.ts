export type IAdjustmentFilterValue = string | string[];

export type IAdjustmentFilters = {
  category: string[];
  title: string[];
  type: string[];
};

export type IAdjustmentItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  created_at: Date;
  updated_at: Date;
};

export type IAdjustmentCard = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverUrl?: string;
  thumbnailUrl?: string;
};

export type IDisabilityWithRelevance = {
  id: string;
  disability_name: string;
  disability_nhs_slug: string | null;
  category: string;
  subcategory: string | null;
  created_at: Date;
  updated_at: Date;
  relevance_score: number;
  notes: string | null;
};

export type IAdjustmentWithDisabilities = IAdjustmentItem & {
  disabilities: IDisabilityWithRelevance[];
};
