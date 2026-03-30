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

// Approvers list (users who can approve requests)
// NOTE: These IDs must match actual Supabase Auth user IDs for the approval workflow to function.
// After creating test users, update the IDs below with the UUIDs from Supabase Dashboard > Authentication > Users
export interface IApprover {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
  department?: string;
}

// TODO: Replace these placeholder IDs with actual Supabase user UUIDs after creating test accounts
// You can find the UUIDs in Supabase Dashboard > Authentication > Users
export const MOCK_APPROVERS: IApprover[] = [
  { id: 'REPLACE_WITH_ADMIN_UUID', name: 'Test Admin', email: 'admin@test.com', role: 'admin', department: 'Administration' },
  { id: 'REPLACE_WITH_APPROVER1_UUID', name: 'Test Approver (HR)', email: 'approver1@test.com', role: 'approver', department: 'Human Resources' },
  { id: 'REPLACE_WITH_APPROVER2_UUID', name: 'Test Approver (Facilities)', email: 'approver2@test.com', role: 'approver', department: 'Facilities' },
  { id: 'REPLACE_WITH_MANAGER_UUID', name: 'Test Manager', email: 'manager@test.com', role: 'manager', department: 'Operations' },
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
