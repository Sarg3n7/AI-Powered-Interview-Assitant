import { createSlice, createSelector } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState: {
    candidates: {},
    searchTerm: '',
    sortBy: 'date', // 'score', 'name', 'date'
    sortOrder: 'desc', // 'asc', 'desc'
  },
  reducers: {
    addCandidate: (state, action) => {
      const { name, email, phone, resumeText, resumeFileName } = action.payload;
      const id = uuidv4();
      state.candidates[id] = {
        id,
        name,
        email,
        phone,
        resumeText,
        resumeFileName,
        finalScore: null,
        aiSummary: null,
        status: 'incomplete',
        createdAt: Date.now(),
        completedAt: null,
      };
    },
    updateCandidate: (state, action) => {
      const { id, updates } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id] = { ...state.candidates[id], ...updates };
      }
    },
    completeCandidate: (state, action) => {
      const { id, finalScore, aiSummary } = action.payload;
      if (state.candidates[id]) {
        state.candidates[id].finalScore = finalScore;
        state.candidates[id].aiSummary = aiSummary;
        state.candidates[id].status = 'completed';
        state.candidates[id].completedAt = Date.now();
      }
    },
    deleteCandidate: (state, action) => {
      const id = action.payload;
      delete state.candidates[id];
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSorting: (state, action) => {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },
  },
});

// Selectors
export const selectAllCandidates = (state) => Object.values(state.candidates.candidates);
export const selectCandidateById = (state, id) => state.candidates.candidates[id];

export const selectFilteredAndSortedCandidates = createSelector(
  [selectAllCandidates, (state) => state.candidates.searchTerm, (state) => state.candidates.sortBy, (state) => state.candidates.sortOrder],
  (candidates, searchTerm, sortBy, sortOrder) => {
    let filtered = candidates;
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(term) ||
        candidate.email.toLowerCase().includes(term)
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'score':
          comparison = (a.finalScore || 0) - (b.finalScore || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.createdAt - b.createdAt;
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }
);

export const { addCandidate, updateCandidate, completeCandidate, deleteCandidate, setSearchTerm, setSorting } = candidatesSlice.actions;
export default candidatesSlice.reducer;