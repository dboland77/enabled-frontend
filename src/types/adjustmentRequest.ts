export type IAdjustmentRequestFilterValue = string | string[];

export enum RequestStatusTypes {
  NEW = 'NEW',
  DENIED = 'DENIED',
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  MORE_INFO = 'MORE_INFO',
}

export type IAdjustmentRequestFilters = {
  adjustmentTypes: string[];
  workfunctions: string[];
  locations: string[];
  benefits: string[];
  disabilities: string[];
  statusFilters: string[];
};

export type IAdjustmentRequestItem = {
  id: string;
  title: string | null;
  detail: string | null;
  createdAt: string;
  adjustmentType: string | null;
  requiredDate: string;
  workfunction: string | null;
  benefit: string | null;
  location: string | null;
  disability: string | null;
  status: RequestStatusTypes | null;
};
