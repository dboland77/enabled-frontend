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
  approverId: string | null;
  approverName: string | null;
  responseMessage?: string | null;
  respondedAt?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
};

// Status labels for display
export const REQUEST_STATUS_LABELS: Record<RequestStatusTypes, string> = {
  [RequestStatusTypes.NEW]: 'New',
  [RequestStatusTypes.PENDING]: 'Pending Review',
  [RequestStatusTypes.APPROVED]: 'Approved',
  [RequestStatusTypes.DENIED]: 'Declined',
  [RequestStatusTypes.MORE_INFO]: 'More Info Required',
};

// Status colors for display
export const REQUEST_STATUS_COLORS: Record<RequestStatusTypes, 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'> = {
  [RequestStatusTypes.NEW]: 'info',
  [RequestStatusTypes.PENDING]: 'warning',
  [RequestStatusTypes.APPROVED]: 'success',
  [RequestStatusTypes.DENIED]: 'error',
  [RequestStatusTypes.MORE_INFO]: 'warning',
};
