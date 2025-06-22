import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useApiCache } from '../hooks/useApiCache';

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

  const [currentSession, setCurrentSession] = useState(null);
  const [isStudying, setIsStudying] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  // Cached dashboard data fetcher
  const dashboardFetcher = useCallback(async (signal) => {
    const response = await axios.get(`${API_URL}/api/study/dashboard`, { signal });
    return response.data;
  }, [API_URL]);

  // Cached timetables fetcher
  const timetablesFetcher = useCallback(async (signal) => {
    const response = await axios.get(`${API_URL}/api/study/timetables`, { signal });
    return response.data;
  }, [API_URL]);

  // Use cached API calls
  const {
    data: dashboardData,
    loading: dashboardLoading,
    invalidateCache: invalidateDashboard
  } = useApiCache('dashboard', dashboardFetcher, []);

  const {
    data: timetablesData,
    loading: timetablesLoading,
    invalidateCache: invalidateTimetables
  } = useApiCache('timetables', timetablesFetcher, []);

  // Update study data when cached data changes
  useEffect(() => {
    if (dashboardData) {
      setStudyData(prev => ({
        ...prev,
        ...dashboardData
      }));
    }
  }, [dashboardData]);

  useEffect(() => {
    if (timetablesData) {
      const active = timetablesData.find(t => t.isActive);
      setStudyData(prev => ({
        ...prev,
        timetables: timetablesData,
        activeTimetable: active
      }));
    }
  }, [timetablesData]);

  // Optimized fetch functions with rate limiting
  const fetchDashboardAndTimetables = useCallback(async () => {
    const now = Date.now();
    // Prevent rapid successive calls (rate limiting)
    if (now - lastFetch < 2000) return;

    setLastFetch(now);
    invalidateDashboard();
    invalidateTimetables();
  }, [lastFetch, invalidateDashboard, invalidateTimetables]);

  const fetchCurrentSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/study/state`);
      if (res.data?.currentSubject) {
        setCurrentSession(res.data);
        setIsStudying(res.data.status === 'active');
      }
    } catch (err) {
      console.error('Failed to fetch session state:', err);
    }
  }, [API_URL]);

  const fetchCompletedSubjects = useCallback(async () => {
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
  }, [API_URL]);

  // Initial data fetch
  useEffect(() => {
    fetchCurrentSession();
    fetchCompletedSubjects();
  }, [fetchCurrentSession, fetchCompletedSubjects]);

  const fetchSessionStats = useCallback(async (period = 'week') => {
    try {
      const res = await axios.get(`${API_URL}/api/study/sessions/stats`, {
        params: { period }
      });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch session stats:', err);
      return null;
    }
  }, [API_URL]);

  const startStudySession = useCallback(async (subject) => {
    const startTime = new Date();
    try {
      const res = await axios.post(`${API_URL}/api/study/state`, {
        currentSubject: subject,
        elapsedTime: 0,
        startTime,
        status: 'active'
      });
      setCurrentSession(res.data);
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }, [API_URL]);

  const pauseSession = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/api/study/state`, {
        ...currentSession,
        status: 'paused'
      });
      setCurrentSession(prev => ({ ...prev, status: 'paused' }));
      setIsStudying(false);
    } catch (err) {
      console.error('Failed to pause session:', err);
    }
  }, [API_URL, currentSession]);

  const resumeSession = useCallback(async () => {
    try {
      await axios.post(`${API_URL}/api/study/state`, {
        ...currentSession,
        status: 'active'
      });
      setCurrentSession(prev => ({ ...prev, status: 'active' }));
      setIsStudying(true);
    } catch (err) {
      console.error('Failed to resume session:', err);
    }
  }, [API_URL, currentSession]);

  const endSession = useCallback(async ({ actualTime, notes = '', targetTime }) => {
    try {
      const endTime = new Date();
      await axios.post(`${API_URL}/api/study/sessions`, {
        subject: currentSession.currentSubject,
        actualTime,
        targetTime,
        startTime: currentSession.startTime,
        endTime,
        completed: true,
        notes
      });
      await axios.delete(`${API_URL}/api/study/state`);
      setCurrentSession(null);
      setIsStudying(false);

      // Refresh data after ending session
      fetchDashboardAndTimetables();
      fetchCompletedSubjects();
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }, [API_URL, currentSession, fetchDashboardAndTimetables, fetchCompletedSubjects]);

  const fetchNotes = useCallback(async (search = '', subject = '', page = 1, limit = 20) => {
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
  }, [API_URL]);

  const value = useMemo(() => ({
    studyData,
    currentSession,
    isStudying,
    loading: dashboardLoading || timetablesLoading,
    startStudySession,
    pauseSession,
    resumeSession,
    endSession,
    fetchDashboardAndTimetables,
    fetchCurrentSession,
    fetchCompletedSubjects,
    fetchSessionStats,
    fetchNotes,
    loadingNotes
  }), [
    studyData,
    currentSession,
    isStudying,
    dashboardLoading,
    timetablesLoading,
    startStudySession,
    pauseSession,
    resumeSession,
    endSession,
    fetchDashboardAndTimetables,
    fetchCurrentSession,
    fetchCompletedSubjects,
    fetchSessionStats,
    fetchNotes,
    loadingNotes
  ]);

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};