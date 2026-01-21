import axios from 'axios';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { HOST_API } from '../config-global';

const initialState = {
  userNotifications: [
    {
      id: 'start',
      title: 'initial title',
      category: 'initial category',
      createdAt: '2024-02-13T15:18:57.739Z',
      isUnRead: false,
      type: 'test type',
      avatarUrl: 'test avatar',
    },
  ],
  userId: null,
  notificationsLoading: true,
};

export const getNotifications = createAsyncThunk(
  'api/getNotifications',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${HOST_API}/notifications`, {
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

export const createNotification = createAsyncThunk(
  'api/createNotification',
  async ({ firstName, lastName, email, password }: any, thunkAPI) => {
    try {
      const response = await axios.post(`${HOST_API}/notifications`, {
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

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getNotifications.pending, (state) => {
      state.notificationsLoading = true;
    });
    builder.addCase(getNotifications.fulfilled, (state, { payload }) => {
      state.userNotifications = payload;
      return state;
    });
    builder.addCase(getNotifications.rejected, (state: any, { payload }) => {
      state.notificationsLoading = false;
    });
  },
});

export const notificationsReducer = notificationsSlice.reducer;

export const fake_notifications = [...Array(9)].map((_, index) => ({
  id: 123,
  avatarUrl: ['src/assets/avatars/avatar1', null, null, null, null, null, null, null, null, null][
    index
  ],
  type: ['friend', 'project', 'file', 'tags', 'payment', 'order', 'chat', 'mail', 'delivery'][
    index
  ],
  category: [
    'Adjustment Request',
    'Project UI',
    'File Manager',
    'File Manager',
    'File Manager',
    'Order',
    'Order',
    'Communication',
    'Communication',
  ][index],
  isUnRead: true,
  createdAt: new Date(),
  title:
    (index === 0 && `<p><strong>Deja Brady</strong> sent you an adjustment request</p>`) ||
    (index === 1 &&
      `<p><strong>Lainey Davidson</strong> added file to <strong><a href='#'>File Manager</a></strong></p>`) ||
    (index === 3 &&
      `<p><strong>Angelique Morse</strong> added new tags to <strong><a href='#'>File Manager<a/></strong></p>`) ||
    (index === 5 && `<p>Your order is placed waiting for shipping</p>`) ||
    (index === 6 && `<p>Delivery processing your order is being shipped</p>`) ||
    (index === 7 && `<p>You have new messages 5 unread messages</p>`) ||
    (index === 8 && `<p>You have new mail`) ||
    '',
}));
