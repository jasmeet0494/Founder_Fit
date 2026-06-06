import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { login, getProfile } from '../lib/api';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      // Fetch profile to decide where to route
      const profile = await getProfile();

      if (!profile.intent) {
        // New user who hasn't chosen intent yet
        navigate('/intent');
      } else {
        // Returning user → go to matches
        navigate('/matches');
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'We could not save your details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-[430px] mx-auto px-6 py-8">
        <div className="flex flex-col mt-5">

          {/* Header */}
          <AuthHeader />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-8 mt-6"></div>

          {/* Form Section */}
          <div className="flex-1 space-y-2">
            <h2 className="font-orb2">Log in</h2>
            <p className="font-mono2">Enter Your Credentials to Continue</p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mt-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mt-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="mt-8">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
                placeholder="Enter your password"
              />
            </div>

            {/* Login Button */}
            <div className="mt-10">
              <GradientButton onClick={handleLogin} disabled={!email || !password || loading}>
                {loading ? 'Logging in...' : 'Login'}
              </GradientButton>
            </div>

            {/* Sign Up Link */}
            <div className="flex items-center justify-center mt-6">
              <span className="mr-2 text-[#00E5FF] font-mono">Don't have an account?</span>
              <button
                onClick={() => navigate('/signup')}
                className="bg-[#0D1120] border-1 border-[#00E5FF] text-[#00E5FF] px-4 py-2 rounded-xl border-0 hover:bg-cyan-accent hover:text-dark-bg transition-colors ml-1"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;