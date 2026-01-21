import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HOST_API } from '@/config-global';

const initialState = {
  adjustments: [
    {
      id: '',
      adjustment_title: '',
      adjustment_type: '',
      adjustment_detail: '',
    },
  ],
  adjustmentsLoading: false,
};

export const getAdjustments = createAsyncThunk(
  'api/getAdjustments',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${HOST_API}/adjustments`);
      return data;
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return rejectWithValue(error.response.data.msg);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const createAdjustment = createAsyncThunk(
  'api/createAdjustment',
  async ({ adjustment_title, adjustment_type, adjustment_detail }: any, thunkAPI) => {
    try {
      const response = await axios.post(`${HOST_API}/adjustments`, {
        adjustment_title,
        adjustment_type,
        adjustment_detail,
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

export const adjustmentsSlice = createSlice({
  name: 'adjustments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAdjustments.pending, (state) => {
      state.adjustmentsLoading = true;
    });
    builder.addCase(getAdjustments.fulfilled, (state, { payload }) => {
      state.adjustments = payload;
      state.adjustmentsLoading = false;
      return state;
    });
    builder.addCase(getAdjustments.rejected, (state: any, { payload }) => {
      state.adjustmentsLoading = false;
    });
    builder.addCase(createAdjustment.pending, (state) => {
      state.adjustmentsLoading = true;
    });
    builder.addCase(createAdjustment.fulfilled, (state, { payload }) => {
      state.adjustments = payload;
      state.adjustmentsLoading = false;
      return state;
    });
    builder.addCase(createAdjustment.rejected, (state: any, { payload }) => {
      state.adjustmentsLoading = false;
    });
  },
});

export const adjustmentsReducer = adjustmentsSlice.reducer;
