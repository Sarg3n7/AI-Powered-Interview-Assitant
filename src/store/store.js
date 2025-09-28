import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import localforage from 'localforage';
import candidatesSlice from './slices/candidatesSlice';
import sessionsSlice from './slices/sessionsSlice';
import uiSlice from './slices/uiSlice';

// Configure localforage for IndexedDB storage
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'SwipeInterviewDB',
  storeName: 'interview_data',
  version: 1.0,
  description: 'Swipe Interview Assistant local storage'
});

const rootReducer = combineReducers({
  candidates: candidatesSlice,
  sessions: sessionsSlice,
  ui: uiSlice,
});

const persistConfig = {
  key: 'root',
  storage: localforage,
  whitelist: ['candidates', 'sessions'], // Don't persist UI state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);