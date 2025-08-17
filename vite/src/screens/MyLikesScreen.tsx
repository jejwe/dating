import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Loader2, MessageCircle, Star } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import BottomNav from '../components/Navigation/BottomNav';
import Avatar from '../components/Common/Avatar';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';

interface LikedUser {
  id: string;
  name: string;
  photos?: string[];
  bio?: string;
  age?: number;
  location?: string;
  created_at: string;
  is_match?: boolean;
}

interface FavoriteUser {
  id: string;
  name: string;
  photos?: string[];
  bio?: string;
  age?: number;
  location?: string;
  created_at: string;
}

const MyLikesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'likes' | 'favorites'>('likes');
  const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
  const [favoriteUsers, setFavoriteUsers] = useState<FavoriteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [likesResponse, favoritesResponse] = await Promise.all([
          apiService.getLikes(),
          apiService.getFavorites()
        ]);
        
        setLikedUsers(likesResponse.likes || []);
        setFavoriteUsers(favoritesResponse.favorites || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleChatClick = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiService.createChatRoom(userId);
      if (response.room_id) {
        navigate(`/chat/${response.room_id}`);
      } else {
        // Fallback to user ID if room_id is not returned
        navigate(`/chat/${userId}`);
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      // Fallback to user ID if chat room creation fails
      navigate(`/chat/${userId}`);
    }
  };

  const handleBack = () => {
    navigate('/my-profile');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Added today';
    } else if (diffDays <= 7) {
      return `Added ${diffDays} days ago`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Added ${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `Added ${months} month${months > 1 ? 's' : ''} ago`;
    }
  };

  const currentUsers = activeTab === 'likes' ? likedUsers : favoriteUsers;
  const isEmpty = currentUsers.length === 0;
  const isLikesTab = activeTab === 'likes';

  if (isLoading) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center">
        <button
          onClick={handleBack}
          className="mr-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div className="flex items-center">
          {isLikesTab ? (
            <Heart size={20} className="text-red-500 mr-2" />
          ) : (
            <Star size={20} className="text-yellow-500 mr-2" />
          )}
          <h1 className="text-lg font-semibold text-white">
            {isLikesTab ? 'My Likes' : 'My Favorites'}
          </h1>
        </div>
        <div className="ml-auto">
          <span className="text-sm text-slate-400">
            {currentUsers.length} {currentUsers.length === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'likes'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <Heart size={16} className="mr-2" />
              My Likes
            </div>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-indigo-400 border-b-2 border-indigo-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center">
              <Star size={16} className="mr-2" />
              My Favorites
            </div>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            {isLikesTab ? (
              <Heart size={48} className="text-slate-600 mb-4" />
            ) : (
              <Star size={48} className="text-slate-600 mb-4" />
            )}
            <h3 className="text-xl font-semibold text-white mb-2">
              {isLikesTab ? 'No likes yet' : 'No favorites yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {isLikesTab 
                ? 'Start liking people to see them here!' 
                : 'Start adding people to favorites to see them here!'
              }
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Discover People
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-colors cursor-pointer border border-slate-700/50"
              >
                <div className="flex items-center">
                  <div className="relative mr-4">
                    <Avatar
                      src={user.photos?.[0]}
                      name={user.name}
                      size="md"
                    />
                    {isLikesTab && (user as LikedUser).is_match && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">✓</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <h3 className="text-lg font-semibold text-white mr-2">
                        {user.name}
                      </h3>
                      {user.age && (
                        <span className="text-sm text-slate-400">
                          {user.age}
                        </span>
                      )}
                    </div>
                    
                    {user.location && (
                      <p className="text-sm text-slate-400 mb-1">
                        📍 {user.location}
                      </p>
                    )}
                    
                    {user.bio && (
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    
                    <p className="text-xs text-slate-500 mt-2">
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => handleChatClick(user.id, e)}
                    className="flex flex-col items-center ml-4 p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    <MessageCircle size={16} className="text-blue-400 mb-1" />
                    <span className="text-xs text-slate-400">Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </ScreenContainer>
  );
};

export default MyLikesScreen;