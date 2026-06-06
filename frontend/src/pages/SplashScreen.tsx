import React from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center text-center px-8">

        {/* Icon */}
        <div className="w-28 h-28 rounded-3xl border-4 border-[#00BCD4] bg-[#152427] flex items-center justify-center mb-8">
          <svg className="w-20 h-20 text-[#00BCD4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {/* Head circle */}
            <circle cx="12" cy="8" r="3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            {/* Body arc */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 20c0-4 3-7 7-7s7 3 7 7" />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 className="font-orb mt-6">
          <span className="text-white">Founder</span>
          <span className="text-[#00BCD4]">Fit</span>
        </h1>

        {/* Subtitle */}
        <p className="tracking-widest font-mono2 uppercase mt-8 mb-6">
          Co-Founder Matching
        </p>

        {/* Tagline */}
        <p className="max-w-xs mt-14 mb-20 font-mono2">
          Find the Co-Founder who completes your start up - not just compliments it
        </p>

        {/* Button */}
        <GradientButton onClick={handleLogin}>
         Get Started
        </GradientButton>
      </div>
    </div>
  );
};

export default SplashScreen;