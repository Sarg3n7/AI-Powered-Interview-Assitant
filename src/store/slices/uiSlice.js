import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    activeTab: 'interviewee',
    showWelcomeBack: false,
    isGeneratingQuestions: false,
    uploadProgress: 0,
    isUploading: false,
    currentStep: 'upload', // upload, validating, chat, generating, interview, completed
    missingFields: [],
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setShowWelcomeBack: (state, action) => {
      state.showWelcomeBack = action.payload;
    },
    setGeneratingQuestions: (state, action) => {
      state.isGeneratingQuestions = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    setUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    setMissingFields: (state, action) => {
      state.missingFields = action.payload;
    },
  },
});

export const {
  setActiveTab,
  setShowWelcomeBack,
  setGeneratingQuestions,
  setUploadProgress,
  setUploading,
  setCurrentStep,
  setMissingFields,
} = uiSlice.actions;

export default uiSlice.reducer;