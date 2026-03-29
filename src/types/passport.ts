import { IAdjustmentRequestItem } from './adjustmentRequest';

export interface IPassportHolder {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  issueDate: Date;
}

export interface IPassportStamp {
  id: string;
  adjustmentTitle: string;
  approvalDate: string;
  approverName: string;
  approverInitials: string;
}

export interface IPassportData {
  passportNumber: string;
  holder: IPassportHolder;
  approvedAdjustments: IAdjustmentRequestItem[];
  stamps: IPassportStamp[];
  issueDate: Date;
  lastUpdated: Date;
}

// Helper to generate approver initials
export function getApproverInitials(name: string | null | undefined): string {
  if (!name) return 'AP';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to generate passport number from user ID
export function generatePassportNumber(userId: string): string {
  const hash = userId.substring(0, 8).toUpperCase();
  return `RAP-${hash}`;
}
