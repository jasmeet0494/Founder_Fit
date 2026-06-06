import React from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';

interface ConfirmationScreenProps {
  selectedMatch: {
    name: string;
    skill: string;
    bio: string;
  } | null;
  userIntent: 'founder' | 'cofounder' | null;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ selectedMatch, userIntent }) => {
  const navigate = useNavigate();

  const handleBackToProfile = () => {
    navigate(userIntent === 'founder' ? '/founder-profile' : '/cofounder-profile');
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-[430px] mx-auto px-6 py-8">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <AuthHeader subtitle='Request Sent' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-2"></div>

          {/* Content */}
          <div className="flex-1 flex flex-col items-center">
            {/* Checkmark Icon */}
            <div className="w-24 h-24 rounded-full border-4 border-cyan-accent flex items-center justify-center mt-8 mb-8">
              <svg className="w-12 h-12 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Connection Request Sent
            </h2>

            {/* Body Text */}
            <p className="text-muted-text text-center mb-8 leading-relaxed">
              You have expressed interest in{' '}
              <span className="text-cyan-accent font-semibold">{selectedMatch?.name || 'your match'}</span>.
              <br />
              They will be notified and accept your request.
            </p>

            {/* Info Box */}
            <div className="w-full bg-dark-card rounded-xl p-4 border border-gray-700 mb-8">
              <h3 className="text-white font-bold mb-2 text-center">What Happens Next:</h3>
              <p className="text-muted-text leading-relaxed text-center">
                {selectedMatch?.name || 'They'} will receive your profile. If they are interested too, you'll both be notified to connect.
              </p>
            </div>

            {/* Buttons */}
            <div className="w-full">
              <div className="mb-3">
                <GradientButton onClick={() => navigate('/matches')}>
                  Back to Matches
                </GradientButton>
              </div>
              <GradientButton onClick={handleBackToProfile}>
                Back to Profile
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationScreen;