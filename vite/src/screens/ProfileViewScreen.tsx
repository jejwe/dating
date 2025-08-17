import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal, Heart, Star, MapPin, Briefcase, MessageCircle } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import Button from '../components/Common/Button';
import { useAppContext } from '../context/AppContext';
import { User } from '../context/AppContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { apiService } from '../services/api';

const ProfileViewScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, likeUser, favoriteUser, unfavoriteUser, getUserActions, getUserById } = useAppContext();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载用户信息的函数
  const loadUser = async (userId: string) => {
    if (isLoadingUser) return; // 防止重复加载
    
    setIsLoadingUser(true);
    setUserLoadError(null);
    
    try {
      // 首先尝试从现有的 users 数组中查找
      const existingUser = users.find(u => u.id === userId);
      if (existingUser) {
        console.log('Found user in existing users array:', existingUser.name);
        setUser(existingUser);
        setIsLoadingUser(false);
        return;
      }
      
      // 如果没有找到，则从API获取
      console.log('User not found in array, fetching from API for userId:', userId);
      const userFromApi = await getUserById(userId);
      if (userFromApi) {
        console.log('Successfully fetched user from API:', userFromApi.name);
        setUser(userFromApi);
      } else {
        setUserLoadError('用户不存在');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      setUserLoadError(error instanceof Error ? error.message : '获取用户信息失败');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // 当用户ID变化时加载用户信息
  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]); // 移除users依赖，避免不必要的重新加载

  // 当users数组更新时，检查是否包含当前用户
  useEffect(() => {
    if (id && !user && !isLoadingUser) {
      const existingUser = users.find(u => u.id === id);
      if (existingUser) {
        console.log('User found in updated users array:', existingUser.name);
        setUser(existingUser);
      }
    }
  }, [users, id, user, isLoadingUser]);

  useEffect(() => {
    const loadUserActions = async () => {
      if (!user) return;
      
      try {
        // 传递target_id参数，只获取当前用户对该特定用户的操作状态
        const { favorites, likedUsers } = await getUserActions(user.id);
        
        // 初始化收藏状态
        if (favorites && Array.isArray(favorites)) {
          const favoriteIds = new Set(favorites.map(fav => fav.user?.id || fav.id).filter(Boolean));
          setIsFavorited(favoriteIds.has(user.id));
        }
        
        // 初始化喜欢状态
        if (likedUsers && Array.isArray(likedUsers)) {
          const likedUserIds = new Set(likedUsers.map(like => like.user?.id || like.id).filter(Boolean));
          setIsLiked(likedUserIds.has(user.id));
        }
      } catch (error) {
        console.error('Failed to load user actions:', error);
      }
    };

    loadUserActions();
  }, [user]); // 移除 getUserActions 依赖

  // 轮播图自动播放
  useEffect(() => {
    if (!user || !user.photos || user.photos.length <= 1) {
      return;
    }

    const startSlideshow = () => {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % user.photos.length);
      }, 3000); // 每3秒切换一次
    };

    startSlideshow();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  // 显示加载状态
  if (isLoadingUser) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </ScreenContainer>
    );
  }

  // 显示错误状态
  if (userLoadError) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center flex-col space-y-4">
          <p className="text-slate-400 text-center">{userLoadError}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => id && loadUser(id)}
          >
            重试
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </ScreenContainer>
    );
  }

  // 用户不存在或未加载
  if (!user) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center flex-col space-y-4">
          <p className="text-slate-400">用户信息不可用</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => id && loadUser(id)}
          >
            重新加载
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            返回
          </Button>
        </div>
      </ScreenContainer>
    );
  }

  /**
   * 处理收藏操作 - 支持状态切换
   */
  const handleAddToFavorites = async () => {
    if (!user) return;
    
    try {
      if (isFavorited) {
        // 取消收藏
        await unfavoriteUser(user.id);
        setIsFavorited(false);
        console.log('Removed from favorites:', user.name);
      } else {
        // 添加收藏
        await favoriteUser(user.id);
        setIsFavorited(true);
        console.log('Added to favorites:', user.name);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  /**
   * 处理点赞操作 - 支持状态切换
   */
  const handleLike = async () => {
    if (!user) return;
    
    const isCurrentlyLiked = isLiked;
    
    try {
      if (isCurrentlyLiked) {
        // 如果已经点赞，则取消点赞
        const response = await likeUser(user.id);
        if (response.unliked) {
          setIsLiked(false);
        }
        return;
      }
      
      const response = await likeUser(user.id);
      
      // 只有在没有取消喜欢的情况下才更新状态
      if (!response.unliked) {
        setIsLiked(true);
        
        // 如果匹配成功，添加到匹配列表但保持当前页面
        if (response.is_match) {
          console.log('Match successful with:', user.name);
        }
      }
    } catch (error) {
      console.error('Like operation failed:', error);
    }
  };

  /**
   * 处理聊天按钮点击 - 创建聊天室并跳转到聊天页面
   */
  const handleChat = async () => {
    if (!user || isCreatingChat) return;
    
    setIsCreatingChat(true);
    
    try {
      // 调用API创建聊天室
      const response = await apiService.createChatRoom(user.id);
      
      if (response.room_id) {
        // 成功创建聊天室，跳转到聊天页面
        navigate(`/chat/${response.room_id}`);
        console.log('Chat room created successfully:', response.room_id);
      } else {
        console.error('Failed to create chat room: No room_id returned');
      }
    } catch (error) {
      console.error('Failed to create chat room:', error);
      // 可以在这里添加错误提示
    } finally {
       setIsCreatingChat(false);
     }
   };

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="relative bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-100">{user.name}'s Profile</h1>
        <button className="absolute right-4 text-slate-400 hover:text-slate-300 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Photo Section */}
        <div className="relative h-80 bg-slate-700 flex items-center justify-center overflow-hidden">
          {user.photos && user.photos.length > 0 && !imageError ? (
            <img
              key={currentImageIndex}
              src={user.photos[currentImageIndex]}
              alt={`${user.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-8xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* 轮播指示器 */}
          {user.photos && user.photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
              {user.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    // 重置轮播计时器
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                    }
                    intervalRef.current = setInterval(() => {
                      setCurrentImageIndex(prev => (prev + 1) % user.photos.length);
                    }, 3000);
                  }}
                  className={`block w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentImageIndex
                      ? 'bg-white opacity-100 scale-125'
                      : 'bg-white opacity-50 hover:opacity-75'
                  }`}
                  aria-label={`View photo ${index + 1}`}
                />
              ))}
            </div>
          )}
          
          {/* 图片计数器 */}
          {user.photos && user.photos.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs">
              {currentImageIndex + 1} / {user.photos.length}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">{user.name}, {user.age}</h1>
              {user.isVerified && (
                <div className="ml-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            {user.isOnline && (
              <span className="text-sm text-green-400 font-semibold flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Online
              </span>
            )}
          </div>

          <div className="space-y-1 mb-4">
            <p className="text-slate-400 text-sm flex items-center">
              <MapPin size={14} className="mr-1 text-slate-500" />
              {user.location}
            </p>
            <p className="text-slate-400 text-sm flex items-center">
              <Briefcase size={14} className="mr-1 text-slate-500" />
              Graphic Designer at Creative Inc.
            </p>
          </div>

          {/* About Section */}
          <div className="mb-4">
            <h3 className="font-semibold text-slate-300 mb-1">About Me</h3>
            <p className="text-slate-400 text-sm">{user.bio}</p>
          </div>

          {/* Interests Section */}
          <div className="mb-4">
            <h3 className="font-semibold text-slate-300 mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="bg-indigo-800 text-indigo-100 px-3 py-1 rounded-full text-sm border border-indigo-600"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-700 flex justify-around">
        <button
          onClick={handleAddToFavorites}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isFavorited
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-slate-700 text-purple-400 hover:bg-slate-600'
          }`}
          title={isFavorited ? "取消收藏" : "添加到收藏"}
        >
          <Star size={28} className={isFavorited ? 'fill-current' : ''} />
        </button>
        <button
          onClick={handleChat}
          disabled={isCreatingChat}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isCreatingChat
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-slate-700 text-blue-400 hover:bg-slate-600 hover:text-blue-300'
          }`}
          title={isCreatingChat ? "创建聊天室中..." : "开始聊天"}
        >
          {isCreatingChat ? (
            <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <MessageCircle size={28} />
          )}
        </button>
        <button
          onClick={handleLike}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            isLiked
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
              : 'bg-slate-700 text-green-400 hover:bg-slate-600'
          }`}
          title={isLiked ? "取消喜欢" : "喜欢"}
        >
          <Heart size={28} className={isLiked ? 'fill-current' : ''} />
        </button>
      </div>
    </ScreenContainer>
  );
};

export default ProfileViewScreen;