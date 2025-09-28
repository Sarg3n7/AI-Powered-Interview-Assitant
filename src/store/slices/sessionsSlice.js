import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const sessionsSlice = createSlice({
  name: 'sessions',
  initialState: {
    sessions: {},
    activeSessionId: null,
  },
  reducers: {
    createSession: (state, action) => {
      const { candidateId, questions } = action.payload;
      const sessionId = uuidv4();
      state.sessions[sessionId] = {
        id: sessionId,
        candidateId,
        questions: questions.map((q, index) => ({
          id: uuidv4(),
          text: q.text,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          startTimestamp: null,
          endTimestamp: null,
          answer: '',
          score: null,
          rubric: q.rubric || null,
          autoSubmitted: false,
        })),
        currentQuestionIndex: 0,
        status: 'not_started',
        pausedAt: null,
        totalPauseTime: 0,
      };
      state.activeSessionId = sessionId;
    },
    startSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = 'in_progress';
        state.activeSessionId = sessionId;
      }
    },
    startQuestion: (state, action) => {
      const { sessionId, questionIndex } = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.questions[questionIndex]) {
        const now = Date.now();
        session.questions[questionIndex].startTimestamp = now;
        session.questions[questionIndex].endTimestamp = now + (session.questions[questionIndex].timeLimit * 1000);
        session.currentQuestionIndex = questionIndex;
        session.status = 'in_progress';
      }
    },
    updateAnswer: (state, action) => {
      const { sessionId, questionIndex, answer } = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.questions[questionIndex]) {
        session.questions[questionIndex].answer = answer;
      }
    },
    submitAnswer: (state, action) => {
      const { sessionId, questionIndex, answer, autoSubmitted = false } = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.questions[questionIndex]) {
        session.questions[questionIndex].answer = answer;
        session.questions[questionIndex].autoSubmitted = autoSubmitted;
        session.questions[questionIndex].endTimestamp = Date.now();
      }
    },
    scoreQuestion: (state, action) => {
      const { sessionId, questionIndex, score, rubric } = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.questions[questionIndex]) {
        session.questions[questionIndex].score = score;
        if (rubric) {
          session.questions[questionIndex].rubric = rubric;
        }
      }
    },
    pauseSession: (state, action) => {
      const sessionId = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.status === 'in_progress') {
        session.status = 'paused';
        session.pausedAt = Date.now();
        
        // Store remaining time for current question
        const currentQ = session.questions[session.currentQuestionIndex];
        if (currentQ && currentQ.endTimestamp) {
          const remainingTime = Math.max(0, currentQ.endTimestamp - Date.now());
          currentQ.remainingTime = remainingTime;
        }
      }
    },
    resumeSession: (state, action) => {
      const sessionId = action.payload;
      const session = state.sessions[sessionId];
      if (session && session.status === 'paused') {
        const pauseDuration = Date.now() - session.pausedAt;
        session.totalPauseTime += pauseDuration;
        
        // Restore timer for current question
        const currentQ = session.questions[session.currentQuestionIndex];
        if (currentQ && currentQ.remainingTime !== undefined) {
          currentQ.endTimestamp = Date.now() + currentQ.remainingTime;
          delete currentQ.remainingTime;
        }
        
        session.status = 'in_progress';
        session.pausedAt = null;
      }
    },
    completeSession: (state, action) => {
      const sessionId = action.payload;
      if (state.sessions[sessionId]) {
        state.sessions[sessionId].status = 'completed';
        if (state.activeSessionId === sessionId) {
          state.activeSessionId = null;
        }
      }
    },
    clearSession: (state, action) => {
      const sessionId = action.payload;
      delete state.sessions[sessionId];
      if (state.activeSessionId === sessionId) {
        state.activeSessionId = null;
      }
    },
  },
});

export const selectActiveSession = (state) => 
  state.sessions.activeSessionId ? state.sessions.sessions[state.sessions.activeSessionId] : null;

export const selectSessionById = (state, id) => state.sessions.sessions[id];

export const {
  createSession,
  startSession,
  startQuestion,
  updateAnswer,
  submitAnswer,
  scoreQuestion,
  pauseSession,
  resumeSession,
  completeSession,
  clearSession,
} = sessionsSlice.actions;

export default sessionsSlice.reducer;