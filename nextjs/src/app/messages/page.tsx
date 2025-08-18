'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import BottomNav from '@/components/Navigation/BottomNav';
import Avatar from '@/components/Common/Avatar';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ErrorMessage from '@/components/Common/ErrorMessage';
import { useRecentMatches } from '@/hooks/useRecentMatches';
import { useAppContext } from '@/context/AppContext';

const MessagesScreenPage: React.FC = () => {
  const router = useRouter();
  const { matches: recentMatches, loading: matchesLoading, error: matchesError, refetch: refetchMatches } = useRecentMatches(5);
  const { chatRooms, loading, error, getChatRooms, getMatches, currentUser } = useAppContext();

  useEffect(() => {
    if (currentUser) {
      getMatches();
      getChatRooms();
    }
  }, [currentUser, getMatches, getChatRooms]);

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / 3600000;
    if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const handleRetry = () => {
    refetchMatches();
    getChatRooms();
  };

  if (matchesLoading || loading) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner text="Loading messages..." /></div>
        <BottomNav />
      </ScreenContainer>
    );
  }

  if (matchesError || error) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center"><ErrorMessage message={matchesError || error || ''} onRetry={handleRetry} /></div>
        <BottomNav />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <div className="p-3"><h1 className="text-xl font-bold text-white">Messages</h1></div>
      <div className="px-3 py-2"><input type="search" placeholder="Search matches..." className="w-full pl-10 pr-4 py-2 bg-slate-800 rounded-xl" /></div>

      <div className="flex-1 overflow-y-auto pb-16">
        {recentMatches.length > 0 && (
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-slate-500">NEW MATCHES</h3>
            <div className="flex space-x-3 overflow-x-auto py-2">
              {recentMatches.map((match) => (
                <div key={`new-${match.id}`} onClick={() => router.push(`/chat/${match.id}`)} className="flex flex-col items-center w-16">
                  <Avatar src={match.user?.photos?.[0]} name={match.user?.name || ''} size="md" />
                  <span className="text-xs text-slate-300 truncate w-full text-center mt-1">{match.user?.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 pt-1">
          <h3 className="text-xs font-medium text-slate-500">CONVERSATIONS</h3>
          {chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div key={room.id} onClick={() => router.push(`/chat/${room.id}`)} className="flex items-center py-2.5 cursor-pointer">
                <Avatar src={room.otherUser?.photos?.[0]} name={room.otherUser?.name || ''} size="md" isOnline={room.otherUser?.is_online} />
                <div className="flex-1 min-w-0 ml-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-slate-200 truncate">{room.otherUser?.name}</h4>
                    <span className="text-xs text-slate-500">{formatMessageTime(room.last_message_time || '')}</span>
                  </div>
                  <p className="text-sm text-slate-400 truncate">{room.last_message?.content}</p>
                </div>
              </div>
            ))
          ) : <p className="text-center text-slate-400 py-8">No conversations yet.</p>}
        </div>
      </div>
      <BottomNav />
    </ScreenContainer>
  );
};

export default MessagesScreenPage;
