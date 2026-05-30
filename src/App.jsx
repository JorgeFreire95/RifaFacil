import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { RaffleProvider } from './context/RaffleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import CreateRaffle from './pages/CreateRaffle';
import RaffleDetails from './pages/RaffleDetails';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { notificationService } from './services/notificationService';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

// Back Button Handler Component
const BackButtonHandler = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If we are on the root path or login, close app or maximize
      if (location.pathname === '/' || location.pathname === '/login') {
        CapacitorApp.exitApp();
      } else {
        // Otherwise go back in history
        navigate(-1);
      }
    });

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate, location]);

  return children;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', padding: '20px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          <h2>Algo salió mal.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  useEffect(() => {
    // Initialize Native UI
    const initNative = async () => {
      try {
        // Hide Splash Screen
        await SplashScreen.hide();

        // Style Status Bar (Match dark theme)
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0f172a' }); // Match --bg-gradient start
      } catch (e) {
        console.warn('Native APIs not available in browser');
      }
    };

    initNative();
    notificationService.requestPermissions();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
      <RaffleProvider>
        <Router>
          <BackButtonHandler>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              <Route path="/" element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } />

              <Route path="/create" element={
                <PrivateRoute>
                  <CreateRaffle />
                </PrivateRoute>
              } />

              <Route path="/edit/:id" element={
                <PrivateRoute>
                  <CreateRaffle />
                </PrivateRoute>
              } />

              <Route path="/raffle/:id" element={
                <PrivateRoute>
                  <RaffleDetails />
                </PrivateRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BackButtonHandler>
        </Router>
      </RaffleProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
