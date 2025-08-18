'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Settings, Heart, X, Star, RotateCcw, Grid3X3, Layers, MapPin, Filter, TrendingUp, RefreshCw, MessageCircle } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import BottomNav from '@/components/Navigation/BottomNav';
import MatchSettings from '@/components/Discovery/MatchSettings';
import { useAppContext } from '@/context/AppContext';
import { MatchEngine, MatchCriteria } from '@/utils/matchEngine';
import { apiService } from '@/lib/api';

const DiscoveryScreen: React.FC = () => {
  const router = useRouter();
  const {
    users,
    loading,
    likeUser,
    superlikeUser,
    unlikeUser,
    skipUser,
    manualRefreshData,
    isAuthenticated,
    favoriteUser,
    unfavoriteUser,
    getUserActions
  } = useAppContext();

  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showMatchSettings, setShowMatchSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria>(MatchEngine.getDefaultCriteria());
  const [creatingChatRooms, setCreatingChatRooms] = useState<Set<string>>(new Set());
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [favoritedUsers, setFavoritedUsers] = useState<Set<string>>(new Set());

  const currentUser = recommendedUsers[currentUserIndex];

  useEffect(() => {
    if (users && users.length > 0) {
        setRecommendedUsers(users);
    }
  }, [users]);

  useEffect(() => {
    const loadUserActions = async () => {
      if (!currentUser || !isAuthenticated) return;
      try {
        const { favorites, likedUsers } = await getUserActions();
        setFavoritedUsers(new Set(favorites?.map((fav: any) => fav.user?.id).filter(Boolean)));
        setLikedUsers(new Set(likedUsers?.map((like: any) => like.user?.id).filter(Boolean)));
      } catch (error) {
        console.error('Failed to load user actions:', error);
      }
    };
    loadUserActions();
  }, [currentUser, isAuthenticated, getUserActions]);

  const handleLike = async (isSuperLike: boolean = false) => {
    if (!currentUser) return;
    try {
      isSuperLike ? await superlikeUser(currentUser.id) : await likeUser(currentUser.id);
      setLikedUsers(prev => new Set([...prev, currentUser.id]));
      handlePass();
    } catch (error) {
      console.error('Like operation failed:', error);
    }
  };

  const handleAddToFavorites = async () => {
    if (!currentUser) return;
    const isFavorited = favoritedUsers.has(currentUser.id);
    try {
      if (isFavorited) {
        await unfavoriteUser(currentUser.id);
        setFavoritedUsers(prev => { const newSet = new Set(prev); newSet.delete(currentUser.id); return newSet; });
      } else {
        await favoriteUser(currentUser.id);
        setFavoritedUsers(prev => new Set([...prev, currentUser.id]));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleChat = async (user: any) => {
    if (creatingChatRooms.has(user.id)) return;
    setCreatingChatRooms(prev => new Set(prev).add(user.id));
    try {
      const response = await apiService.createChatRoom(user.id);
      if (response.room_id) {
        router.push(`/chat/${response.room_id}`);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
    } finally {
      setCreatingChatRooms(prev => { const newSet = new Set(prev); newSet.delete(user.id); return newSet; });
    }
  };

  const handlePass = () => {
    if (currentUserIndex < recommendedUsers.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await manualRefreshData();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (showMatchSettings) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900">
                <MatchSettings
                    onBack={() => setShowMatchSettings(false)}
                    onSave={(criteria) => { setMatchCriteria(criteria); setShowMatchSettings(false); }}
                    initialCriteria={matchCriteria}
                />
            </div>
        </div>
    );
  }

  return (
    <ScreenContainer>
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <button onClick={() => router.push('/my-profile')}><User size={24} /></button>
        <div className="flex items-center space-x-2">
            <button onClick={handleManualRefresh} disabled={isRefreshing}><RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} /></button>
            <button onClick={() => setShowMatchSettings(true)}><Filter size={20} /></button>
            <button onClick={() => router.push('/settings')}><Settings size={24} /></button>
        </div>
      </div>
      <div className="p-2">
        <div className="flex justify-center p-1 bg-slate-700/50 rounded-xl">
            <button onClick={() => setViewMode('cards')} className={`flex-1 py-2 px-4 rounded-lg ${viewMode === 'cards' ? 'bg-indigo-600' : ''}`}><Layers size={16} /> Cards</button>
            <button onClick={() => setViewMode('grid')} className={`flex-1 py-2 px-4 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600' : ''}`}><Grid3X3 size={16} /> Grid</button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && !currentUser && <p>No more users.</p>}

      {!loading && currentUser && viewMode === 'cards' && (
        <div className="flex-1 p-4">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-700" onClick={() => router.push(`/profile/${currentUser.id}`)}>
            <img src={currentUser.photos[0]} alt={currentUser.name} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-2xl font-bold">{currentUser.name}, {currentUser.age}</h2>
                <p>{currentUser.location}</p>
                <p className="text-sm mt-2">{currentUser.bio}</p>
            </div>
          </div>
          <div className="flex justify-center items-center space-x-4 mt-4">
            <button onClick={() => handlePass()} className="p-4 bg-slate-700 rounded-full"><X/></button>
            <button onClick={() => handleAddToFavorites()} className="p-3 bg-slate-700 rounded-full"><Star className={favoritedUsers.has(currentUser.id) ? 'fill-current' : ''}/></button>
            <button onClick={() => handleLike(false)} className="p-4 bg-slate-700 rounded-full"><Heart className={likedUsers.has(currentUser.id) ? 'fill-current' : ''}/></button>
            <button onClick={() => handleChat(currentUser)} className="p-3 bg-slate-700 rounded-full"><MessageCircle/></button>
          </div>
        </div>
      )}

      {!loading && viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-4 p-4 overflow-y-auto">
              {recommendedUsers.map(user => (
                  <div key={user.id} className="relative rounded-xl overflow-hidden aspect-[3/4]" onClick={() => router.push(`/profile/${user.id}`)}>
                      <img src={user.photos[0]} alt={user.name} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
                          <h3 className="font-semibold">{user.name}, {user.age}</h3>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <BottomNav />
    </ScreenContainer>
  );
};

export default DiscoveryScreen;
