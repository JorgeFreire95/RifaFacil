import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app'; // Import Capacitor App Plugin
import { RaffleProvider } from './context/RaffleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import CreateRaffle from './pages/CreateRaffle';
import RaffleDetails from './pages/RaffleDetails';
import Login from './pages/Login';

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


function App() {
  return (
    <AuthProvider>
      <RaffleProvider>
        <Router>
          <BackButtonHandler>
            <Routes>
              <Route path="/login" element={<Login />} />

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
            </Routes>
          </BackButtonHandler>
        </Router>
      </RaffleProvider>
    </AuthProvider>
  );
}

export default App;
