import { configureStore, combineReducers } from '@reduxjs/toolkit';

import {
  authReducer,
  nhsDataReducer,
  userProfileReducer,
  adjustmentsReducer,
  disabilitiesReducer,
  notificationsReducer,
  adjustmentRequestsReducer,
} from '../slices';

const rootReducer = combineReducers({
  auth: authReducer,
  userProfile: userProfileReducer,
  nhsData: nhsDataReducer,
  notifications: notificationsReducer,
  adjustmentRequests: adjustmentRequestsReducer,
  adjustments: adjustmentsReducer,
  disabilities: disabilitiesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
