// User role types for the application
export type UserRoleType = 'admin' | 'approver' | 'manager' | 'employee';

export interface IUserRole {
  value: UserRoleType;
  label: string;
  description: string;
  canApprove: boolean;
}

export const USER_ROLES: IUserRole[] = [
  { value: 'admin', label: 'Administrator', description: 'Full system access', canApprove: true },
  { value: 'approver', label: 'Approver', description: 'Can approve adjustment requests', canApprove: true },
  { value: 'manager', label: 'Manager', description: 'Team management and approval', canApprove: true },
  { value: 'employee', label: 'Employee', description: 'Standard user access', canApprove: false },
];

// Mock approvers list (users who can approve requests)
export interface IApprover {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  department?: string;
}

export const MOCK_APPROVERS: IApprover[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'manager', department: 'Human Resources' },
  { id: '2', name: 'Michael Chen', email: 'michael.chen@company.com', role: 'approver', department: 'Operations' },
  { id: '3', name: 'Emma Williams', email: 'emma.williams@company.com', role: 'manager', department: 'IT Services' },
  { id: '4', name: 'James Brown', email: 'james.brown@company.com', role: 'admin', department: 'Administration' },
  { id: '5', name: 'Lisa Davis', email: 'lisa.davis@company.com', role: 'approver', department: 'Facilities' },
];

export type IUserTableFilterValue = string | string[];

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

export type IUserProfileCover = {
  name: string;
  role: string | null;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: Date;
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  postCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  isVerified: boolean;
};

export type IUserAccount = {
  email: string;
  displayName: string;
  city: string | null;
  state: string | null;
  about: string | null;
  country: string | null;
  address: string | null;
  postCode: string | null;
  phoneNumber: string | null;
};

export type IUserAccountChangePassword = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};
