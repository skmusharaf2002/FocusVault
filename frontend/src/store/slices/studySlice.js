import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  "study/fetchDashboardData",
  async (_, { rejectWithValue }) => {
    try {
      const [dashboardRes, timetableRes] = await Promise.all([
        axios.get(`${API_URL}/api/study/dashboard`),
        axios.get(`${API_URL}/api/study/timetables`),
      ]);

      const activeTimetable = timetableRes.data.find((t) => t.isActive);

      return {
        ...dashboardRes.data,
        timetables: timetableRes.data,
        activeTimetable,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }
);

export const fetchSessionState = createAsyncThunk(
  "study/fetchSessionState",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/study/state`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch session state"
      );
    }
  }
);

export const startSession = createAsyncThunk(
  "study/startSession",
  async ({ subject, targetTime }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/study/state/start`, {
        subject,
        targetTime,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start session"
      );
    }
  }
);

export const updateSession = createAsyncThunk(
  "study/updateSession",
  async ({ sessionId, updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/api/study/state/${sessionId}`,
        updates
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update session"
      );
    }
  }
);

export const endSession = createAsyncThunk(
  "study/endSession",
  async ({ sessionId, notes }, { rejectWithValue, dispatch }) => {
    try {
      await axios.post(`${API_URL}/api/study/state/${sessionId}/end`, {
        notes,
      });
      // Refresh dashboard data after ending session
      dispatch(fetchDashboardData());
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to end session"
      );
    }
  }
);

export const fetchNotes = createAsyncThunk(
  "study/fetchNotes",
  async ({ search = "", page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/study/notes`, {
        params: { search, page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notes"
      );
    }
  }
);

export const createNote = createAsyncThunk(
  "study/createNote",
  async (noteData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/study/notes`, noteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create note"
      );
    }
  }
);

export const fetchTimetables = createAsyncThunk(
  "study/fetchTimetables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/study/timetables`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch timetables"
      );
    }
  }
);

export const createTimetable = createAsyncThunk(
  "study/createTimetable",
  async (timetableData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/study/timetables`,
        timetableData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create timetable"
      );
    }
  }
);

const initialState = {
  // Dashboard data
  todayReading: 0,
  studySessions: 0,
  currentStreak: 0,
  highestStreak: 0,
  totalStudyHours: 0,
  totalSessions: 0,
  subjectsStudied: [],
  weeklyData: [],
  completedSubjects: [],

  // Session state
  currentSession: null,
  activeSessions: [],
  isStudying: false,

  // Timetables
  timetables: [],
  activeTimetable: null,

  // Notes
  notes: [],
  notesLoading: false,
  notesPagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },

  // UI state
  loading: false,
  error: null,
};

const studySlice = createSlice({
  name: "study",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      state.isStudying = action.payload?.status === "active";
    },
    updateSessionTime: (state, action) => {
      if (
        state.currentSession &&
        state.currentSession.sessionId === action.payload.sessionId
      ) {
        state.currentSession.elapsedTime = action.payload.elapsedTime;
      }
    },
    addNote: (state, action) => {
      state.notes.unshift(action.payload);
    },
    updateNote: (state, action) => {
      const index = state.notes.findIndex(
        (note) => note._id === action.payload._id
      );
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
    },
    removeNote: (state, action) => {
      state.notes = state.notes.filter((note) => note._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch session state
      .addCase(fetchSessionState.fulfilled, (state, action) => {
        state.activeSessions = action.payload;
        const activeSession = action.payload.find(
          (session) => session.status === "active"
        );
        state.currentSession = activeSession || null;
        state.isStudying = !!activeSession;
      })

      // Start session
      .addCase(startSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.isStudying = true;
        state.activeSessions = [
          action.payload,
          ...state.activeSessions.filter(
            (s) => s.sessionId !== action.payload.sessionId
          ),
        ];
      })

      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        if (state.currentSession?.sessionId === action.payload.sessionId) {
          state.currentSession = action.payload;
          state.isStudying = action.payload.status === "active";
        }

        const index = state.activeSessions.findIndex(
          (s) => s.sessionId === action.payload.sessionId
        );
        if (index !== -1) {
          state.activeSessions[index] = action.payload;
        }
      })

      // End session
      .addCase(endSession.fulfilled, (state, action) => {
        state.currentSession = null;
        state.isStudying = false;
        state.activeSessions = state.activeSessions.filter(
          (s) => s.sessionId !== action.payload
        );
      })

      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.notesLoading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.notesLoading = false;
        if (action.payload.notes) {
          state.notes = action.payload.notes;
          state.notesPagination = {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalCount: action.payload.totalCount,
          };
        } else {
          state.notes = action.payload;
        }
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.notesLoading = false;
        state.error = action.payload;
      })

      // Create note
      .addCase(createNote.fulfilled, (state, action) => {
        state.notes.unshift(action.payload);
      })

      // Fetch timetables
      .addCase(fetchTimetables.fulfilled, (state, action) => {
        state.timetables = action.payload;
        state.activeTimetable = action.payload.find((t) => t.isActive) || null;
      })

      // Create timetable
      .addCase(createTimetable.fulfilled, (state, action) => {
        state.timetables.push(action.payload);
        if (action.payload.isActive) {
          state.activeTimetable = action.payload;
        }
      });
  },
});

export const {
  clearError,
  setCurrentSession,
  updateSessionTime,
  addNote,
  updateNote,
  removeNote,
} = studySlice.actions;

export default studySlice.reducer;
