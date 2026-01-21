import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HOST_API } from '../config-global';

const initialState = {
  firstname: 'first',
  lastname: 'last',
  userId: '12',
  avatarUrl:
    'https://res.cloudinary.com/dzwy71sza/image/upload/v1764760570/profile_pics/ebnejt3en7i5reszi5x6.jpg',
  profileLoading: true,
};

export const getUserProfile = createAsyncThunk(
  'api/getUserProfile',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${HOST_API}/user-profile`, {
        params: {
          userId,
        },
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

export const updateUserProfile = createAsyncThunk(
  'api/updateUserProfile',
  async ({ firstName, lastName, email, password, avatarurl }: any, thunkAPI) => {
    try {
      const response = await axios.post(`${HOST_API}/updateUserProfile`, {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
        avatarurl,
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

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getUserProfile.pending, (state) => {
      state.profileLoading = true;
    });
    builder.addCase(getUserProfile.fulfilled, (state, { payload }) => ({
      ...payload,
      profileLoading: false,
    }));
    builder.addCase(getUserProfile.rejected, (state: any, { payload }) => {
      state.profileLoading = false;
    });
  },
});

export const userProfileReducer = userProfileSlice.reducer;
