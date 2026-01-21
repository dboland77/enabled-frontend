import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { NHS_API, NHS_API_KEY } from '../config-global';

const initialState = {
  loadingNHSData: false,
};

export const getConditionDetails = createAsyncThunk(
  'api/getConditions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${NHS_API}`, {
        headers: { 'subscription-key': NHS_API_KEY },
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

export const nhsDataSlice = createSlice({
  name: 'NHSData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getConditionDetails.pending, (state) => {
      state.loadingNHSData = true;
    });
    builder.addCase(getConditionDetails.fulfilled, (state, { payload }) => payload);
    builder.addCase(getConditionDetails.rejected, (state: any, { payload }) => {
      state.loadingNHSData = false;
    });
  },
});

export const nhsDataReducer = nhsDataSlice.reducer;
