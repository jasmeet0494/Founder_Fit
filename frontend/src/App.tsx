import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import SignUpScreen from './pages/SignUpScreen';
import IntentScreen from './pages/IntentScreen';
import FounderProfileScreen from './pages/FounderProfileScreen';
import CofounderProfileScreen from './pages/CofounderProfileScreen';
import MatchResultsScreen from './pages/MatchResultsScreen';
import ConfirmationScreen from './pages/ConfirmationScreen';
import ProtectedRoute from './components/ProtectedRoute';

interface SelectedMatch {
  name: string;
  skill: string;
  bio: string;
  initials?: string;
}

function App() {
  const [userIntent, setUserIntent] = useState<'founder' | 'cofounder' | null>(null);
  // No-op setters: profile data is now saved to the API directly.
  // These are kept to satisfy child component props without lifting state.
  const noopFounder = useCallback(() => {}, []);
  const noopCofounder = useCallback(() => {}, []);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />

          {/* Protected routes — require authentication */}
          <Route
            path="/intent"
            element={
              <ProtectedRoute>
                <IntentScreen setUserIntent={setUserIntent} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/founder-profile"
            element={
              <ProtectedRoute>
                <FounderProfileScreen setFounderData={noopFounder} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cofounder-profile"
            element={
              <ProtectedRoute>
                <CofounderProfileScreen setCofounderData={noopCofounder} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchResultsScreen setSelectedMatch={setSelectedMatch} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmation"
            element={
              <ProtectedRoute>
                <ConfirmationScreen
                  selectedMatch={selectedMatch}
                  userIntent={userIntent}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;