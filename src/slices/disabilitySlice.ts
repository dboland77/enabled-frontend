import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HOST_API } from '@/config-global';

const initialState = {
  disabilities: [
    {
      id: '',
      name: '',
      slug: '',
    },
  ],
  disabilitiesLoading: false,
};

export const getDisabilities = createAsyncThunk(
  'api/getDisabilities',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${HOST_API}/disabilities`, {});
      return data;
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return rejectWithValue(error.response.data.msg);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const createDisability = createAsyncThunk(
  'api/createDisability',
  async ({ name, slug }: any, thunkAPI) => {
    try {
      const response = await axios.post(`${HOST_API}/disabilities`, {
        name,
        slug,
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

export const disabilitiesSlice = createSlice({
  name: 'disabilities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDisabilities.pending, (state) => {
      state.disabilitiesLoading = true;
    });
    builder.addCase(getDisabilities.fulfilled, (state, { payload }) => {
      state.disabilities = payload;
      state.disabilitiesLoading = false;
      return state;
    });
    builder.addCase(getDisabilities.rejected, (state: any, { payload }) => {
      state.disabilitiesLoading = false;
    });
    builder.addCase(createDisability.pending, (state) => {
      state.disabilitiesLoading = true;
    });
    builder.addCase(createDisability.fulfilled, (state, { payload }) => {
      state.disabilities = payload;
      state.disabilitiesLoading = false;
      return state;
    });
    builder.addCase(createDisability.rejected, (state: any, { payload }) => {
      state.disabilitiesLoading = false;
    });
  },
});

export const disabilitiesReducer = disabilitiesSlice.reducer;
