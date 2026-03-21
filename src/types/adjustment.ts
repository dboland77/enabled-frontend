export type IAdjustmentFilterValue = string | string[];

export type IAdjustmentFilters = {
  adjustmentType: string[];
  workfunctions: string[];
  locations: string[];
  benefits: string[];
  disabilities: string[];
};

export type IAdjustmentItem = {
  id: string;
  title: string | null;
  detail: string | null;
  type: string | null;
};

export type IAdjustmentCard = {
  id: string;
  title: string;
  type: string;
  detail: string;
  coverUrl?: string;
  thumbnailUrl?: string;
};
