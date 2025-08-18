'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import ScreenHeader from '@/components/Layout/ScreenHeader';
import { useAppContext } from '@/context/AppContext';

const SettingsScreenPage: React.FC = () => {
  const router = useRouter();
  const { currentUser, logout, updateUserProfile } = useAppContext();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(currentUser?.email || '');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSaveEmail = async () => {
    await updateUserProfile({ email: emailValue });
    setIsEditingEmail(false);
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Settings" showBack />
      <div className="flex-1 p-4 divide-y divide-slate-700">
        <div className="py-4">
          <h3 className="text-xs font-semibold text-slate-500">ACCOUNT</h3>
          <div className="flex justify-between items-center p-3">
            <span>Email</span>
            {!isEditingEmail ? (
              <button onClick={() => setIsEditingEmail(true)}>{currentUser?.email} <span className="text-indigo-400">Edit</span></button>
            ) : (
              <div>
                <input value={emailValue} onChange={(e) => setEmailValue(e.target.value)} className="bg-slate-600" />
                <button onClick={handleSaveEmail}>Save</button>
                <button onClick={() => setIsEditingEmail(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
        <div className="py-6 text-center">
          <button onClick={handleLogout} className="w-full py-3 rounded-lg bg-red-600 text-white">
            Log Out
          </button>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default SettingsScreenPage;
