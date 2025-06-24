import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppDispatch, useAuth, useUI } from './hooks/useRedux';
import { fetchCurrentUser } from './store/slices/authSlice';
import { fetchDashboardData } from './store/slices/studySlice';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './components/home/Home';
import ReadingSpace from './pages/ReadingSpace';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import Help from './pages/Help';
import AboutUs from './pages/AboutUs';
import TermsAndConditions from './pages/TermsAndConditions';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import AuthCallback from './pages/auth/AuthCallback';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import LoadingScreen from './components/ui/LoadingScreen';
import StudySession from './components/study/StudySession';
import FeedbackPage from './pages/Feedback';
import Rankings from './pages/Ranking';
import PhoneVerification from './pages/auth/PhoneVerification';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Tutorial from './components/tutorial/Tutorial';

function App() {
  const dispatch = useAppDispatch();
  const { user, loading, isAuthenticated, phoneVerificationStep, onboardingRequired } = useAuth();
  const { tutorialCompleted } = useUI();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, isAuthenticated, user]);

  if (loading) return <LoadingScreen />;

  const isOnVerifyPage = location.pathname.startsWith('/verify-email');
  const isOnTermsPage = location.pathname === '/terms';
  const isOnForgotPasswordPage = location.pathname === '/forgot-password';

  // Allow access to terms and forgot password without authentication
  if (isOnTermsPage || isOnForgotPasswordPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Routes>
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    );
  }

  if (user && !user.emailVerified && !isOnVerifyPage) {
    return <EmailVerification />;
  }

  // Phone verification flow
  if (user && user.emailVerified && phoneVerificationStep && phoneVerificationStep !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <PhoneVerification
            onComplete={() => {
              // Phone verification completed, check if onboarding is needed
            }}
          />
        </div>
      </div>
    );
  }

  // Onboarding flow
  if (user && user.emailVerified && user.phoneVerified && onboardingRequired) {
    return (
      <OnboardingFlow
        onComplete={() => {
          // Onboarding completed
        }}
      />
    );
  }

  // Tutorial for first-time users
  if (user && user.emailVerified && user.phoneVerified && !onboardingRequired && !tutorialCompleted) {
    return <Tutorial />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Routes>
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {user ? (
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/reading" element={<ReadingSpace />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/session" element={<StudySession />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;