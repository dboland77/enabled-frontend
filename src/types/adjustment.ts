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
  adjustment_title: string | null;
  adjustment_detail: string | null;
  adjustment_type: string | null;
};

export type IAdjustmentCard = {
  id: string;
  adjustment_title: string;
  adjustment_type: string;
  adjustment_detail: string;
  coverUrl?: string;
  thumbnailUrl?: string;
};
