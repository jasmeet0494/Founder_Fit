import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { updateProfile } from '../lib/api';

interface CofounderProfileScreenProps {
  setCofounderData: (data: {
    skillDomain: string;
    yearsExp: string;
    bio: string;
    industry: string;
    remotePreference: string;
  }) => void;
}

const CofounderProfileScreen: React.FC<CofounderProfileScreenProps> = ({ setCofounderData }) => {
  const navigate = useNavigate();
  const [skillDomain, setSkillDomain] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [bio, setBio] = useState('');
  const [industry, setIndustry] = useState('');
  const [remotePreference, setRemotePreference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const skills = ['Technical', 'Commercial', 'Operational', 'Design', 'Legal'];
  const industries = ['Tech', 'Fintech', 'Health Tech', 'Ed-Tech', 'Climate Tech', 'Other'];
  const remoteOptions = ['Yes', 'No', 'Flexible'];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Backend intent 'cofounder' = user IS a cofounder (maps from frontend 'founder' intent)
      await updateProfile({
        intent: 'cofounder',
        skill_domain: skillDomain,
        years_experience: yearsExp ? parseInt(yearsExp, 10) : undefined,
        short_bio: bio,
        preferred_industry: industry,
        open_to_remote: remotePreference,
      });

      setCofounderData({ skillDomain, yearsExp, bio, industry, remotePreference });
      navigate('/matches');
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
            <button onClick={() => navigate('/intent')}>
              <svg className="w-6 h-6 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Header */}
          <AuthHeader subtitle='Step 2 of 2 - Your Skills' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-6"></div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="font-orb2 mb-6">Tell us about yourself</h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Your Skill Domain */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Your Skill Domain
              </label>
              <select
                value={skillDomain}
                onChange={(e) => setSkillDomain(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
              >
                <option value="">Select your skill domain</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Years of Experience */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Years of Experience
              </label>
              <input
                type="number"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
                placeholder="Enter years of experience"
                min="0"
              />
            </div>

            {/* Short Bio */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Short Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent h-24 resize-none"
                placeholder="Tell us about yourself"
              />
            </div>

            {/* Preferred Industry */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Preferred Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
              >
                <option value="">Select preferred industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Open to Remote */}
            <div className="mb-8">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Open to Remote
              </label>
              <div className="flex gap-3">
                {remoteOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => setRemotePreference(option)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${remotePreference === option
                      ? 'bg-gradient-to-r from-cyan-accent to-purple-accent text-white'
                      : 'bg-dark-card text-muted-text border border-gray-700 hover:shadow-[0_2px_16px_rgba(0,229,255,0.3)]'
                      }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <GradientButton onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Find a start-up'}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CofounderProfileScreen;