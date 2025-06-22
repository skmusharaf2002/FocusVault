import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const StudyContext = createContext();

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};

export const StudyProvider = ({ children }) => {
  const [studyData, setStudyData] = useState({
    todayReading: 0,
    studySessions: 0,
    currentStreak: 0,
    highestStreak: 0,
    weeklyData: [],
    timetables: [],
    activeTimetable: null,
    notes: [],
    completedSubjects: []
  });

  const [activeSessions, setActiveSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const API_URL = import.meta.env.API_URL || 'http://localhost:5000';

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // Set up axios interceptor for authentication
  useEffect(() => {
    const token = getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  // useEffect(() => {
  //   fetchDashboardAndTimetables();
  //   fetchActiveSessions();
  //   fetchCompletedSubjects();
  // }, []);

  const fetchDashboardAndTimetables = async () => {
    try {
      const [dashboardRes, timetableRes] = await Promise.all([
        axios.get(`${API_URL}/api/study/dashboard`),
        axios.get(`${API_URL}/api/study/timetables`)
      ]);
      const active = timetableRes.data.find(t => t.isActive);
      setStudyData(prev => ({
        ...prev,
        ...dashboardRes.data,
        timetables: timetableRes.data,
        activeTimetable: active
      }));
    } catch (err) {
      console.error('Failed to fetch dashboard/timetables:', err);
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/state`);
      setActiveSessions(res.data || []);

      // Set current session to the most recent active one
      const activeSession = res.data.find(session => session.status === 'active');
      if (activeSession) {
        setCurrentSession(activeSession);
        setIsStudying(true);
      } else {
        setCurrentSession(null);
        setIsStudying(false);
      }
    } catch (err) {
      console.error('Failed to fetch active sessions:', err);
    }
  };

  const fetchCompletedSubjects = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/sessions/today`);
      setStudyData(prev => ({
        ...prev,
        completedSubjects: res.data || []
      }));
    } catch (err) {
      console.error('Failed to fetch completed subjects:', err);
      setStudyData(prev => ({
        ...prev,
        completedSubjects: []
      }));
    }
  };

  const fetchSessionStats = async (period = 'week', subject = null) => {
    try {
      const params = new URLSearchParams({ period });
      if (subject) params.append('subject', subject);

      const res = await axios.get(`${API_URL}/api/study/sessions/stats?${params.toString()}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch session stats:', err);
      return null;
    }
  };

  const startStudySession = async (subject, targetTime = 3600) => {
    try {
      const res = await axios.post(`${API_URL}/api/study/state/start`, {
        subject,
        targetTime
      });

      const newSession = res.data;
      setCurrentSession(newSession);
      setIsStudying(true);

      // Update active sessions
      setActiveSessions(prev => {
        const filtered = prev.filter(s => s.subject !== subject);
        return [newSession, ...filtered];
      });

      return newSession;
    } catch (err) {
      console.error('Failed to start session:', err);
      throw err;
    }
  };

  const pauseSession = async (sessionId = null) => {
    try {
      const targetSessionId = sessionId || currentSession?.sessionId;
      if (!targetSessionId) return;

      const res = await axios.put(`${API_URL}/api/study/state/${targetSessionId}`, {
        status: 'paused'
      });

      const updatedSession = res.data;
      setCurrentSession(updatedSession);
      setIsStudying(false);

      // Update active sessions
      setActiveSessions(prev =>
        prev.map(s => s.sessionId === targetSessionId ? updatedSession : s)
      );

      return updatedSession;
    } catch (err) {
      console.error('Failed to pause session:', err);
      throw err;
    }
  };

  const resumeSession = async (sessionId = null) => {
    try {
      const targetSessionId = sessionId || currentSession?.sessionId;
      if (!targetSessionId) return;

      const res = await axios.put(`${API_URL}/api/study/state/${targetSessionId}`, {
        status: 'active'
      });

      const updatedSession = res.data;
      setCurrentSession(updatedSession);
      setIsStudying(true);

      // Update active sessions
      setActiveSessions(prev =>
        prev.map(s => s.sessionId === targetSessionId ? updatedSession : s)
      );

      return updatedSession;
    } catch (err) {
      console.error('Failed to resume session:', err);
      throw err;
    }
  };

  const updateSessionTime = async (sessionId, elapsedTime) => {
    try {
      const res = await axios.put(`${API_URL}/api/study/state/${sessionId}`, {
        elapsedTime
      });

      const updatedSession = res.data;
      if (currentSession?.sessionId === sessionId) {
        setCurrentSession(updatedSession);
      }

      // Update active sessions
      setActiveSessions(prev =>
        prev.map(s => s.sessionId === sessionId ? updatedSession : s)
      );

      return updatedSession;
    } catch (err) {
      console.error('Failed to update session time:', err);
      throw err;
    }
  };

  const endSession = async (sessionId = null, notes = '') => {
    try {
      const targetSessionId = sessionId || currentSession?.sessionId;
      if (!targetSessionId) return;

      await axios.post(`${API_URL}/api/study/state/${targetSessionId}/end`, {
        notes
      });

      // Clear current session if it was the one ended
      if (currentSession?.sessionId === targetSessionId) {
        setCurrentSession(null);
        setIsStudying(false);
      }

      // Remove from active sessions
      setActiveSessions(prev =>
        prev.filter(s => s.sessionId !== targetSessionId)
      );

      // Refresh data
      await Promise.all([
        fetchDashboardAndTimetables(),
        fetchCompletedSubjects()
      ]);

    } catch (err) {
      console.error('Failed to end session:', err);
      throw err;
    }
  };

  const cancelSession = async (sessionId) => {
    try {
      await axios.delete(`${API_URL}/api/study/state/${sessionId}`);

      // Clear current session if it was the one cancelled
      if (currentSession?.sessionId === sessionId) {
        setCurrentSession(null);
        setIsStudying(false);
      }

      // Remove from active sessions
      setActiveSessions(prev =>
        prev.filter(s => s.sessionId !== sessionId)
      );

    } catch (err) {
      console.error('Failed to cancel session:', err);
      throw err;
    }
  };

  const fetchNotes = async (search = '', subject = '', page = 1, limit = 10) => {
    try {
      setLoadingNotes(true);
      const params = new URLSearchParams({ search, subject, page, limit });
      const res = await axios.get(`${API_URL}/api/study/notes?${params.toString()}`);
      setStudyData(prev => ({ ...prev, notes: res.data }));
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Helper functions for UI
  const getPausedSessions = () => {
    return activeSessions.filter(session => session.status === 'paused');
  };

  const getActiveSession = () => {
    return activeSessions.find(session => session.status === 'active');
  };

  const getSessionBySubject = (subject) => {
    return activeSessions.find(session => session.subject === subject);
  };

  const value = useMemo(() => ({
    studyData,
    activeSessions,
    currentSession,
    isStudying,
    startStudySession,
    pauseSession,
    resumeSession,
    updateSessionTime,
    endSession,
    cancelSession,
    fetchDashboardAndTimetables,
    fetchActiveSessions,
    fetchCompletedSubjects,
    fetchSessionStats,
    fetchNotes,
    loadingNotes,
    // Helper functions
    getPausedSessions,
    getActiveSession,
    getSessionBySubject,
  }), [
    studyData,
    activeSessions,
    currentSession,
    isStudying,
    loadingNotes
  ]);

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};