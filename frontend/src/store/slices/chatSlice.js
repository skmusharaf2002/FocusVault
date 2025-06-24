import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Async thunks
export const fetchChatMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/messages/${roomId}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

export const fetchRecentRooms = createAsyncThunk(
  "chat/fetchRecentRooms",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/rooms`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch recent rooms"
      );
    }
  }
);

export const uploadChatMedia = createAsyncThunk(
  "chat/uploadMedia",
  async ({ file, roomId }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("roomId", roomId);

      const response = await axios.post(
        `${API_URL}/api/chat/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to upload media"
      );
    }
  }
);

const initialState = {
  currentRoom: null,
  messages: [],
  roomUsers: [],
  isInRoom: false,
  recentRooms: [],
  loading: false,
  error: null,
  uploadingMedia: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
      state.isInRoom = !!action.payload;
    },
    setRoomUsers: (state, action) => {
      state.roomUsers = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessage: (state, action) => {
      const index = state.messages.findIndex(
        (msg) => msg._id === action.payload._id
      );
      if (index !== -1) {
        state.messages[index] = action.payload;
      }
    },
    removeMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    leaveRoom: (state) => {
      state.currentRoom = null;
      state.isInRoom = false;
      state.messages = [];
      state.roomUsers = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recent rooms
      .addCase(fetchRecentRooms.fulfilled, (state, action) => {
        state.recentRooms = action.payload;
      })

      // Upload media
      .addCase(uploadChatMedia.pending, (state) => {
        state.uploadingMedia = true;
      })
      .addCase(uploadChatMedia.fulfilled, (state, action) => {
        state.uploadingMedia = false;
        state.messages.push(action.payload);
      })
      .addCase(uploadChatMedia.rejected, (state, action) => {
        state.uploadingMedia = false;
        state.error = action.payload;
      });
  },
});

export const {
  setCurrentRoom,
  setRoomUsers,
  addMessage,
  updateMessage,
  removeMessage,
  clearMessages,
  leaveRoom,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;
