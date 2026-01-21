import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { AuthStateType } from 'src/frontend/routes/auth/types';

import { HOST_API } from '../config-global';

const initialState: AuthStateType = {
  authLoading: false,
  isSignedIn: false,
  authError: null,
  email: '',
  authenticated: false,
  role: null,
  id: null,
  managerId: null,
};

export const signinUser = createAsyncThunk(
  'api/signin',
  async ({ email, password }: any, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${HOST_API}/signin`, {
        email,
        password,
      });

      return data;
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return rejectWithValue(error.response.data.msg);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'api/register',
  async ({ firstName, lastName, email, password }: any, thunkAPI) => {
    try {
      const response = await axios.post(`${HOST_API}/register`, {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return thunkAPI.rejectWithValue(error.response.data.msg);
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signout: (state: any) => {
      state.isSignedIn = false;
      state.authError = '';
      state.authenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUser.pending, (state) => {
      state.authLoading = true;
      state.authError = null;
    });
    builder.addCase(registerUser.fulfilled, (state, { payload }) => {
      state.authLoading = false;
      state.authenticated = true;
    });
    builder.addCase(registerUser.rejected, (state: any, { payload }) => {
      state.authLoading = false;
      state.authError = payload;
    });
    builder.addCase(signinUser.pending, (state) => {
      state.authLoading = true;
      state.authError = null;
    });
    builder.addCase(signinUser.fulfilled, (state, { payload }) => {
      state.authLoading = false;
      state.isSignedIn = true;
      state.authenticated = true;
      state.id = payload.id;
      state.managerId = payload.managerId;
      state.role = payload.role;
      state.email = payload.email;
    });
    builder.addCase(signinUser.rejected, (state: any, { payload }) => {
      state.authLoading = false;
      state.authError = payload;
      state.isSignedIn = false;
    });
  },
});

export const { signout } = authSlice.actions;
export const authReducer = authSlice.reducer;
