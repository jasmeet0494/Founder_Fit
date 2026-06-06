import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../components/GradientButton';
import AuthHeader from '../components/AuthHeader';
import { updateProfile } from '../lib/api';

interface FounderProfileScreenProps {
  setFounderData: (data: {
    startupName: string;
    pitch: string;
    industry: string;
    stage: string;
    skillNeeded: string;
  }) => void;
}

const FounderProfileScreen: React.FC<FounderProfileScreenProps> = ({ setFounderData }) => {
  const navigate = useNavigate();
  const [startupName, setStartupName] = useState('');
  const [pitch, setPitch] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');
  const [skillNeeded, setSkillNeeded] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const industries = ['Tech', 'Fintech', 'Health Tech', 'Ed-Tech', 'Climate Tech', 'Other'];
  const skills = ['Technical', 'Commercial', 'Operational', 'Design', 'Legal'];
  const stages = ['Idea', 'Prototype', 'Revenue'];

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Backend intent 'founder' = user IS a founder (maps from frontend 'cofounder' intent)
      await updateProfile({
        intent: 'founder',
        startup_name: startupName,
        one_liner_pitch: pitch,
        industry,
        current_stage: stage,
        cofounder_skill_needed: skillNeeded,
      });

      setFounderData({ startupName, pitch, industry, stage, skillNeeded });
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
          <AuthHeader subtitle='Step 2 of 2 - Your Idea' />

          {/* Divider */}
          <div className="w-full h-px bg-gray-700 mb-6"></div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto">
            <h2 className="font-orb2 mb-6">Tell us about your start-up</h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg px-4 py-3 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Startup Name */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Startup Name
              </label>
              <input
                type="text"
                value={startupName}
                onChange={(e) => setStartupName(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
                placeholder="Enter your startup name"
              />
            </div>

            {/* One Liner Pitch */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                One Liner Pitch
              </label>
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent h-24 resize-none"
                placeholder="Describe your startup in one line"
              />
            </div>

            {/* Industry */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
              >
                <option value="">Select industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Current Stage */}
            <div className="mb-4">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Current Stage
              </label>
              <div className="flex gap-3">
                {stages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${stage === s
                      ? 'bg-gradient-to-r from-cyan-accent to-purple-accent text-white'
                      : 'bg-dark-card text-muted-text border border-gray-700 hover:shadow-[0_2px_16px_rgba(0,229,255,0.3)]'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Co-Founder Skill Needed */}
            <div className="mb-8">
              <label className="block uppercase font-mono2 text-base mb-1 font-bold">
                Co-Founder Skill Needed
              </label>
              <select
                value={skillNeeded}
                onChange={(e) => setSkillNeeded(e.target.value)}
                className="w-full bg-dark-card border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-accent"
              >
                <option value="">Select skill needed</option>
                {skills.map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <GradientButton onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Find My Co - Founder'}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FounderProfileScreen;