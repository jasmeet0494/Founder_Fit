import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { signup, login } from '../lib/api';

const SignUpScreen: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Create account
      await signup(fullName, email, password);

      // Auto-login to get access_token
      await login(email, password);

      // New user → go to Intent Selection (profile.intent is null)
      navigate('/intent');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'We could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-[430px] mx-auto px-6 py-8">
        <div className="flex flex-col min-h-screen">
          {/* Back Arrow */}
          <div className="flex justify-start mb-4">
            <button onClick={() => navigate('/login')}>
              <svg className="w-6 h-6 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <AuthHeader subtitle='Create Your Account' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-8"></div>

          {/* Form Section */}
          <div className="flex-1 space-y-2">
            <h2 className="font-orb2">Get Started</h2>
            <p className="font-mono2">Join founders finding their perfect match</p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mt-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Full Name Field */}
            <div className="my-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent hover:border-[#2BD9EF]"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Field */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent hover:border-[#2BD9EF]"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent hover:border-[#2BD9EF]"
                placeholder="Create a password"
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-8">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent hover:border-[#2BD9EF]"
                placeholder="Confirm your password"
              />
            </div>

            {/* Create Account Button */}
            <GradientButton onClick={handleSignUp} disabled={!email || !password || !confirmPassword || !fullName || loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;