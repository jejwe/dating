'use client';

import React, { useState } from 'react';
import { Settings, ChevronLeft, Save, RotateCcw, Info } from 'lucide-react';
import { MatchEngine, MatchCriteria } from '@/utils/matchEngine';

interface MatchSettingsProps {
  onBack: () => void;
  onSave: (criteria: MatchCriteria) => void;
  initialCriteria?: MatchCriteria;
}

const MatchSettings: React.FC<MatchSettingsProps> = ({
  onBack,
  onSave,
  initialCriteria
}) => {
  const [criteria, setCriteria] = useState<MatchCriteria>(
    initialCriteria || MatchEngine.getDefaultCriteria()
  );
  const [hasChanges, setHasChanges] = useState(false);

  const availableInterests = [
    'Travel', 'Photography', 'Movies', 'Cooking', 'Reading',
    'Gaming', 'Music', 'Hiking', 'Art', 'Dancing', 'Fitness', 'Coffee',
    'Yoga', 'Pets', 'Wine', 'Books', 'Technology', 'Sports',
    'Fashion', 'Food', 'Nature', 'Adventure', 'Writing', 'Theater'
  ];

  const handleInterestToggle = (interest: string) => {
    setCriteria(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];

      setHasChanges(true);
      return { ...prev, interests: newInterests };
    });
  };

  const handleAgeRangeChange = (index: number, value: number) => {
    setCriteria(prev => {
      const newAgeRange: [number, number] = [...prev.ageRange];
      newAgeRange[index] = value;

      // Ensure min <= max
      if (index === 0 && value > newAgeRange[1]) {
        newAgeRange[1] = value;
      } else if (index === 1 && value < newAgeRange[0]) {
        newAgeRange[0] = value;
      }

      setHasChanges(true);
      return { ...prev, ageRange: newAgeRange };
    });
  };

  const handleSave = () => {
    onSave(criteria);
    onBack();
  };

  const handleReset = () => {
    setCriteria(MatchEngine.getDefaultCriteria());
    setHasChanges(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-indigo-400 hover:text-indigo-300 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-white">Match Preferences</h2>
          <p className="text-xs text-slate-400">Customize who you see</p>
        </div>
        <button
          onClick={handleReset}
          className="text-slate-400 hover:text-indigo-400 transition-colors mr-3"
          title="Reset to defaults"
        >
          <RotateCcw size={18} />
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            hasChanges
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save size={16} className="inline mr-1" />
          Save
        </button>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Age Range */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-400 text-lg">🎂</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Age Range</h3>
              <p className="text-xs text-slate-400">Set your preferred age range</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <label className="text-sm text-slate-300 w-16">Min:</label>
              <input
                type="range"
                min="18"
                max="65"
                value={criteria.ageRange[0]}
                onChange={(e) => handleAgeRangeChange(0, parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-sm text-white font-medium w-12">{criteria.ageRange[0]}</span>
            </div>

            <div className="flex items-center space-x-3">
              <label className="text-sm text-slate-300 w-16">Max:</label>
              <input
                type="range"
                min="18"
                max="65"
                value={criteria.ageRange[1]}
                onChange={(e) => handleAgeRangeChange(1, parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-sm text-white font-medium w-12">{criteria.ageRange[1]}</span>
            </div>
          </div>

          <div className="mt-3 p-2 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              Age range: {criteria.ageRange[0]} - {criteria.ageRange[1]} years old
            </p>
          </div>
        </div>

        {/* Distance */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-400 text-lg">📍</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Maximum Distance</h3>
              <p className="text-xs text-slate-400">How far are you willing to travel?</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="range"
              min="1"
              max="200"
              value={criteria.maxDistance}
              onChange={(e) => {
                setCriteria(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }));
                setHasChanges(true);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">1 km</span>
              <span className="text-sm font-medium text-white">{criteria.maxDistance} km</span>
              <span className="text-sm text-slate-400">200 km</span>
            </div>
          </div>
        </div>

        {/* Interests */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-400 text-lg">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Interests</h3>
              <p className="text-xs text-slate-400">Select interests to find compatible matches</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => handleInterestToggle(interest)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  criteria.interests.includes(interest)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="mt-3 p-2 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              {criteria.interests.length} interest{criteria.interests.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        </div>

        {/* Gender Preferences */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
              <span className="text-indigo-400 text-lg">👥</span>
            </div>
            <div>
              <h3 className="font-semibold text-white">Gender Preferences</h3>
              <p className="text-xs text-slate-400">Who are you interested in?</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { value: 'everyone', label: 'Everyone' },
              { value: 'men', label: 'Men' },
              { value: 'women', label: 'Women' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setCriteria(prev => ({ ...prev, interestedIn: option.value }));
                  setHasChanges(true);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  criteria.interestedIn === option.value
                    ? 'bg-indigo-600 text-white border border-indigo-600'
                    : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-start">
            <Info size={16} className="text-indigo-400 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-indigo-300">
              <p className="font-medium mb-1">💡 Pro Tip</p>
              <p>
                The more specific your preferences, the better your matches will be.
                However, being too restrictive might limit your options.
                Find the right balance for you!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchSettings;
