import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { updateProfileWithFrontendIntent } from '../lib/api';

interface IntentScreenProps {
  setUserIntent: (intent: 'founder' | 'cofounder') => void;
}

const IntentScreen: React.FC<IntentScreenProps> = ({ setUserIntent }) => {
  const navigate = useNavigate();
  const [selectedIntent, setSelectedIntent] = useState<'founder' | 'cofounder' | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedIntent) return;

    setError('');
    setLoading(true);

    try {
      // Save intent to backend (API flips the value to match backend convention)
      await updateProfileWithFrontendIntent({ intent: selectedIntent });

      setUserIntent(selectedIntent);
      navigate(selectedIntent === 'founder' ? '/cofounder-profile' : '/founder-profile');
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
          <AuthHeader subtitle='Step 1 of 2' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-8"></div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h2 className="font-orb2">What are you looking for?</h2>
            <p className="font-mono2">This helps us show you the right matches</p>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mt-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Pill Toggle */}
            <div className="flex gap-4 my-6">
              <button
                onClick={() => setSelectedIntent('cofounder')}
                className={`flex-1 py-4 rounded-xl font-semibold transition-all ${selectedIntent === 'cofounder'
                  ? 'bg-gradient-to-r from-cyan-accent to-purple-accent text-white'
                  : 'bg-dark-card text-muted-text border border-gray-700 hover:shadow-[0_8px_24px_rgba(0,229,255,0.3)]'
                  }`}
              >
                Co - Founder
              </button>
              <button
                onClick={() => setSelectedIntent('founder')}
                className={`flex-1 py-4 rounded-xl font-semibold transition-all ${selectedIntent === 'founder'
                  ? 'bg-gradient-to-r from-cyan-accent to-purple-accent text-white'
                  : 'bg-dark-card text-muted-text border border-gray-700 hover:shadow-[0_8px_24px_rgba(0,229,255,0.3)]'
                  }`}
              >
                Start - Up
              </button>
            </div>

            {/* Description Card */}
            {selectedIntent && (
              <div className="bg-dark-card rounded-lg p-3 mb-8 border border-gray-700 font-mono2">
                <h3 className="text-cyan-accent font-semibold">
                  {selectedIntent === 'cofounder' ? 'Co-Founder' : 'Start-Up'}
                </h3>
                <p className="text-muted-text leading-relaxed">
                  {selectedIntent === 'cofounder'
                    ? 'You are a founder — You have a start-up idea and need a skilled co-founder to build it with you'
                    : 'You are a co-founder — You have skills and want to join a promising start-up as an equity partner'}
                </p>
              </div>
            )}

            {/* Continue Button */}
            <GradientButton onClick={handleContinue} disabled={!selectedIntent || loading}>
              {loading ? 'Saving...' : 'Continue'}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntentScreen;