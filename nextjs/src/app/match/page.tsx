'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import Button from '@/components/Common/Button';
import { useAppContext, User } from '@/context/AppContext';

const MatchScreenPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, getUserById } = useAppContext();
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const matchedUserId = searchParams.get('userId');
    if (matchedUserId) {
      const fetchUser = async () => {
          setLoading(true);
          const user = await getUserById(matchedUserId);
          setMatchedUser(user);
          setLoading(false);
      }
      fetchUser();
    } else {
        setLoading(false);
    }
  }, [searchParams, getUserById]);

  if (loading) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Loading match...</p>
        </div>
      </ScreenContainer>
    );
  }

  if (!matchedUser || !currentUser) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Match information not found.</p>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-gradient-to-br from-indigo-800 to-purple-800">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h1 className="text-4xl font-bold text-white mb-6">It's a Match!</h1>
        <div className="flex items-center justify-center mb-8 relative">
          <img src={currentUser.photos?.[0]} alt="Your Avatar" className="w-24 h-24 rounded-full border-4 border-purple-500 -mr-6 z-10 object-cover" />
          <img src={matchedUser.photos?.[0]} alt="Matched User Avatar" className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover" />
        </div>
        <p className="text-slate-200 text-lg mb-8">
          You and {matchedUser.name} have liked each other.
        </p>
        <div className="w-full space-y-4">
          <button onClick={() => router.push(`/chat/${matchedUser.id}`)} className="w-full bg-white hover:bg-gray-100 text-indigo-700 font-bold py-4 px-6 rounded-lg">
            Send a Message
          </button>
          <Button variant="outline" fullWidth onClick={() => router.push('/discovery')}>
            Keep Swiping
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default MatchScreenPage;
