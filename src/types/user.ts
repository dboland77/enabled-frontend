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

// Approvers list with actual Supabase user UUIDs for the approval workflow
export const MOCK_APPROVERS: IApprover[] = [
  { id: 'eef04542-94a2-4618-bc55-f4536c722e6c', name: 'Alex Admin', email: 'admin@test.com', role: 'admin', department: 'IT Services' },
  { id: '43fc7041-8b09-47a9-962c-6db0e4b9e42b', name: 'Sarah HR', email: 'approver@test.com', role: 'approver', department: 'Human Resources' },
  { id: '4600bfd6-e691-4fd2-8fc2-2b404a70facd', name: 'David Facilities', email: 'approver2@test.com', role: 'approver', department: 'Facilities' },
  { id: '0af3e4bc-6940-436a-bc66-e56f382c3b90', name: 'Mike Manager', email: 'manager@test.com', role: 'manager', department: 'Engineering' },
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
