import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { RequestStatusTypes } from '@/types/adjustmentRequest';

import { HOST_API } from '@/config-global';

const currentDate = new Date();

const initialState = {
  adjustmentRequests: [
    {
      id: 'PLACEHOLDER',
      title: '',
      detail: '',
      adjustmentType: '',
      disability: '',
      workfunction: '',
      benefit: '',
      location: '',
      status: RequestStatusTypes.NEW,
      requiredDate: currentDate.toISOString(),
      createdAt: currentDate.toISOString(),
    },
  ],
  userId: null,
  adjustmentRequestsLoading: true,
};

export const getAdjustmentRequests = createAsyncThunk(
  'api/getAdjustmentRequests',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${HOST_API}/adjustment-requests`, {
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

export const createAdjustmentRequest = createAsyncThunk(
  'api/createAdjustmentRequest',
  async (
    {
      userId,
      detail,
      adjustmentType,
      workfunction,
      benefit,
      location,
      status,
      title,
      requiredDate,
    }: any,
    thunkAPI
  ) => {
    try {
      const response = await axios.post(`${HOST_API}/adjustment-requests`, {
        userId,
        detail,
        adjustmentType,
        workfunction,
        benefit,
        location,
        status,
        title,
        requiredDate,
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

export const deleteAdjustmentRequest = createAsyncThunk(
  'api/deleteAdjustmentRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${HOST_API}/adjustment-requests`, {
        params: {
          id,
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return rejectWithValue(error.response.data.msg);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateAdjustmentRequest = createAsyncThunk(
  'api/updateAdjustmentRequest',
  async (
    {
      id,
      title,
      detail,
      adjustmentType,
      workfunction,
      status,
      benefit,
      location,
      requiredDate,
      userId,
    }: any,
    thunkAPI
  ) => {
    try {
      const response = await axios.put(`${HOST_API}/adjustment-requests`, {
        id,
        title,
        detail,
        adjustmentType,
        workfunction,
        status,
        benefit,
        location,
        requiredDate,
        userId,
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

export const deleteManyAdjustmentRequests = createAsyncThunk(
  'api/deleteManyAdjustmentRequests',
  async (idsToDelete: string[], { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${HOST_API}/adjustment-requests/bulk`, {
        data: { idsToDelete },
      });
      return { response: response.data, idsToDelete };
    } catch (error: any) {
      if (error.response && error.response.data.msg) {
        return rejectWithValue(error.response.data.msg);
      }
      return rejectWithValue(error.message);
    }
  }
);

export const adjustmentRequestSlice = createSlice({
  name: 'adjustmentRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAdjustmentRequests.pending, (state) => {
      state.adjustmentRequestsLoading = true;
    });
    builder.addCase(getAdjustmentRequests.fulfilled, (state, { payload }) => {
      state.adjustmentRequests = payload;
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(getAdjustmentRequests.rejected, (state: any, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(createAdjustmentRequest.pending, (state) => {
      state.adjustmentRequestsLoading = true;
    });
    builder.addCase(createAdjustmentRequest.fulfilled, (state, { payload }) => {
      state.adjustmentRequestsLoading = false;
      state.adjustmentRequests.push(payload);
    });
    builder.addCase(createAdjustmentRequest.rejected, (state: any, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(deleteAdjustmentRequest.pending, (state) => {
      state.adjustmentRequestsLoading = true;
    });
    builder.addCase(deleteAdjustmentRequest.fulfilled, (state, { payload }) => {
      state.adjustmentRequests = state.adjustmentRequests.filter((a) => a.id !== payload.id);
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(deleteAdjustmentRequest.rejected, (state: any, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(deleteManyAdjustmentRequests.pending, (state) => {
      state.adjustmentRequestsLoading = true;
    });
    builder.addCase(deleteManyAdjustmentRequests.fulfilled, (state, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(deleteManyAdjustmentRequests.rejected, (state: any, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
    builder.addCase(updateAdjustmentRequest.pending, (state) => {
      state.adjustmentRequestsLoading = true;
    });
    builder.addCase(updateAdjustmentRequest.fulfilled, (state, { payload }) => {
      state.adjustmentRequestsLoading = false;
      state.adjustmentRequests.push(payload);
    });
    builder.addCase(updateAdjustmentRequest.rejected, (state: any, { payload }) => {
      state.adjustmentRequestsLoading = false;
    });
  },
});

export const adjustmentRequestsReducer = adjustmentRequestSlice.reducer;
