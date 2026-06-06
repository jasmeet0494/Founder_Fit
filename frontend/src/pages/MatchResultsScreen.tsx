import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { getMatches, sendConnection, getInitials, type MatchProfile } from '../lib/api';

interface Match {
  id: string;
  name: string;
  skill: string;
  bio: string;
  initials: string;
}

interface MatchResultsScreenProps {
  setSelectedMatch: (match: Match) => void;
}

const MatchResultsScreen: React.FC<MatchResultsScreenProps> = ({ setSelectedMatch }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await getMatches();

        const mapped: Match[] = data.map((m: MatchProfile) => ({
          id: m.id,
          name: m.full_name,
          skill: m.skill_domain || m.cofounder_skill_needed || 'N/A',
          bio: m.short_bio || m.one_liner_pitch || '',
          initials: getInitials(m.full_name),
        }));

        setMatches(mapped);
      } catch (err: unknown) {
        const apiErr = err as { message?: string };
        setError(apiErr.message || 'Could not load matches. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleConnect = async (match: Match) => {
    setConnecting(match.id);

    try {
      await sendConnection(match.id);
      setSelectedMatch(match);
      navigate('/confirmation');
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr.message || 'Could not send connection request. Please try again.');
      setConnecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="w-full max-w-[430px] mx-auto px-6 py-8">
        <div className="flex flex-col min-h-screen">
          {/* Back Arrow */}
          <div className="flex justify-start mb-4">
            <button onClick={() => navigate(-1)}>
              <svg className="w-6 h-6 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <AuthHeader subtitle='Your Matches' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-6"></div>

          {/* Content */}
          <div className="flex-1">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center mt-12">
                <div className="w-10 h-10 border-4 border-cyan-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted-text font-mono2">Finding your matches...</p>
              </div>
            )}

            {/* No matches */}
            {!loading && !error && matches.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-12">
                <p className="text-muted-text font-mono2 text-center">
                  No matches found yet. Complete your profile to get matched!
                </p>
              </div>
            )}

            {/* Match Cards */}
            {!loading && matches.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  {matches.length} Match{matches.length !== 1 ? 'es' : ''} Found
                </h2>

                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="bg-dark-card rounded-xl p-4 border border-gray-700 mb-4">
                      <div className="flex items-start gap-4 mb-3">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-teal-900 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{match.initials}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{match.name}</h3>
                          <span className="inline-block bg-teal-900 text-cyan-accent px-3 py-1 rounded-full text-sm mb-2">
                            {match.skill}
                          </span>
                          <p className="text-muted-text text-sm tracking-wider">{match.bio}</p>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <div className="mt-3">
                        <GradientButton
                          onClick={() => handleConnect(match)}
                          disabled={connecting !== null}
                        >
                          {connecting === match.id ? 'Connecting...' : 'Connect'}
                        </GradientButton>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchResultsScreen;