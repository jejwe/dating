'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Loader2, MessageCircle, Star } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import BottomNav from '@/components/Navigation/BottomNav';
import Avatar from '@/components/Common/Avatar';
import { useAppContext } from '@/context/AppContext';
import { apiService } from '@/lib/api';

interface LikedUser {
  id: string; name: string; photos?: string[]; bio?: string; age?: number;
  location?: string; created_at: string; is_match?: boolean;
}

interface FavoriteUser {
  id: string; name: string; photos?: string[]; bio?: string; age?: number;
  location?: string; created_at: string;
}

const MyLikesScreenPage: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'likes' | 'favorites'>('likes');
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [likes, favorites] = await Promise.all([
          apiService.getLikes(),
          apiService.getFavorites()
        ]);
        setLikedUsers(likes.likes || []);
        setFavoriteUsers(favorites.favorites || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChatClick = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await apiService.createChatRoom(userId);
    router.push(`/chat/${res.room_id}`);
  };

  const currentUsers = activeTab === 'likes' ? likedUsers : favoriteUsers;

  return (
    <ScreenContainer>
      <div className="p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4"><ArrowLeft size={20} /></button>
        <h1 className="text-lg font-semibold text-white">{activeTab === 'likes' ? 'My Likes' : 'My Favorites'}</h1>
      </div>
      <div className="flex border-b border-slate-700">
        <button onClick={() => setActiveTab('likes')} className={`flex-1 py-3 ${activeTab === 'likes' ? 'border-b-2 border-indigo-400 text-indigo-400' : 'text-slate-400'}`}>Likes</button>
        <button onClick={() => setActiveTab('favorites')} className={`flex-1 py-3 ${activeTab === 'favorites' ? 'border-b-2 border-indigo-400 text-indigo-400' : 'text-slate-400'}`}>Favorites</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {isLoading ? <Loader2 className="animate-spin" /> : (
          currentUsers.length === 0 ? <p>No users found.</p> : (
            <div className="space-y-4">
              {currentUsers.map((user) => (
                <div key={user.id} onClick={() => router.push(`/profile/${user.id}`)} className="bg-slate-800/50 rounded-xl p-4 flex items-center">
                  <Avatar src={user.photos?.[0]} name={user.name} size="md" />
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-slate-400">{user.bio}</p>
                  </div>
                  <button onClick={(e) => handleChatClick(user.id, e)} className="p-2"><MessageCircle size={16} /></button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <BottomNav />
    </ScreenContainer>
  );
};

export default MyLikesScreenPage;
