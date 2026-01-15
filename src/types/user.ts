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
