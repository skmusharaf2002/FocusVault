import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import Home from './pages/Home';
import ReadingSpace from './pages/ReadingSpace';
import Todo from './pages/Todo';
import Calendar from './pages/Calendar';
import Profile from './pages/Profile';
import About from './pages/AboutUs';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import EmailVerification from './pages/auth/EmailVerification';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user is logged in but email not verified
  const isEmailVerified = user?.emailVerified !== false; // Assume verified if not explicitly false

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Routes>
        {user ? (
          !isEmailVerified ? (
            // Show email verification screen
            <Route path="*" element={<EmailVerification />} />
          ) : (
            // Show main app
            <>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/reading" element={<ReadingSpace />} />
                <Route path="/todo" element={<Todo />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </>
          )
        ) : (
          // Show auth screens
          <>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;