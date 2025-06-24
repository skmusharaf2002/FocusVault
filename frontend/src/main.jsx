import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { store, persistor } from './store/index.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { FeedbackProvider } from './context/FeedbackContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundry.jsx';
import LoadingScreen from './components/ui/LoadingScreen.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { StudyProvider } from './context/StudyContext.jsx';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Request notification permission
if ('Notification' in window && 'serviceWorker' in navigator) {
  Notification.requestPermission().then((permission) => {
    console.log('Notification permission:', permission);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <BrowserRouter>
          <AuthProvider>
            <StudyProvider>
              <ThemeProvider>
                <SocketProvider>
                  <FeedbackProvider>
                    <ErrorBoundary>
                      <App />
                    </ErrorBoundary>
                  </FeedbackProvider>
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#1F2937',
                        color: '#F9FAFB',
                        borderRadius: '12px',
                        padding: '12px 16px'
                      }
                    }}
                  />
                </SocketProvider>
              </ThemeProvider>
            </StudyProvider>
          </AuthProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);