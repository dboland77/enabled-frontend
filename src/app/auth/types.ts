export type ActionMapType<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

export type AuthUserType = null | Record<string, any>;

export type AuthStateType = {
  authLoading: boolean;
  isSignedIn: boolean;
  authError: string | null;
  email: string;
  authenticated: boolean;
  role: string | null;
  id: string | null;
  managerId: string | null;
};

export type AuthContextType = {
  user: AuthUserType;
  method: string;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type SignUpFormValues = {
  email: string;
  password: string;
};
