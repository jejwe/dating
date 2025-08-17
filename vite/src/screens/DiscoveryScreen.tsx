import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Heart, X, Star, RotateCcw, Grid3X3, Layers, MapPin, Filter, TrendingUp, RefreshCw, MessageCircle } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import BottomNav from '../components/Navigation/BottomNav';
import Avatar from '../components/Common/Avatar';
import MatchSettings from '../components/Discovery/MatchSettings';
import { useAppContext } from '../context/AppContext';
import { MatchEngine, MatchCriteria } from '../utils/matchEngine';
import { apiService } from '../services/api';

const DiscoveryScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    users, 
    addMatch, 
    loading, 
    error, 
    favoriteUser, 
    unfavoriteUser,
    getUserActions,
    likeUser,
    unlikeUser,
    superlikeUser,
    manualRefreshData,
    isAuthenticated
  } = useAppContext();
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  // 跟踪图片加载失败的用户ID
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [showMatchSettings, setShowMatchSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * 处理图片加载失败的函数
   * @param userId - 用户ID
   */
  const handleImageError = (userId: string) => {
    setFailedImages(prev => new Set(prev).add(userId));
  };
  const [matchCriteria, setMatchCriteria] = useState<MatchCriteria>(MatchEngine.getDefaultCriteria());
  const [creatingChatRooms, setCreatingChatRooms] = useState<Set<string>>(new Set());
  const [recommendedUsers, setRecommendedUsers] = useState<any[]>([]);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const [likedUsers, setLikedUsers] = useState<Set<string>>(new Set());
  const [favoritedUsers, setFavoritedUsers] = useState<Set<string>>(new Set());

  const currentUser = recommendedUsers[currentUserIndex] || users[currentUserIndex];

  useEffect(() => {
    // 使用真实的当前用户数据进行匹配推荐
    // 如果没有当前用户数据，则不进行匹配算法处理
    if (!users || users.length === 0) {
      setRecommendedUsers([]);
      return;
    }
    
    // 直接使用用户列表，不进行复杂的匹配算法
    setRecommendedUsers(users);
  }, [users, matchCriteria]);

  /**
   * 获取用户收藏和喜欢状态并初始化
   */
  useEffect(() => {
    const loadUserActions = async () => {
      try {
        const { favorites, likedUsers } = await getUserActions();
        
        // 初始化收藏状态
        if (favorites && Array.isArray(favorites)) {
          const favoriteIds = new Set(favorites.map(fav => fav.user?.id || fav.id).filter(Boolean));
          setFavoritedUsers(favoriteIds);
        }
        
        // 初始化喜欢状态
        if (likedUsers && Array.isArray(likedUsers)) {
          const likedUserIds = new Set(likedUsers.map(like => like.user?.id || like.id).filter(Boolean));
          setLikedUsers(likedUserIds);
        }
      } catch (error) {
        console.error('Failed to load user actions:', error);
        // 错误情况下设置空状态，避免重试
        setFavoritedUsers(new Set());
        setLikedUsers(new Set());
      }
    };

    // 只在组件挂载时执行一次，并且只在用户已认证且有推荐用户时执行
    if (currentUser && isAuthenticated && recommendedUsers.length > 0) {
      loadUserActions();
    }
  }, [currentUser, isAuthenticated, recommendedUsers.length]); // 添加明确的依赖

  /**
   * 处理点赞操作 - 支持状态切换
   * @param isSuperLike - 是否为超级点赞
   */
  const handleLike = async (isSuperLike: boolean = false) => {
    if (!currentUser) return;
    
    const isCurrentlyLiked = likedUsers.has(currentUser.id);
    
    try {
      if (isCurrentlyLiked) {
        // 如果已经点赞，则取消点赞
        const response = await likeUser(currentUser.id);
        if (response.unliked) {
          setLikedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(currentUser.id);
            return newSet;
          });
        }
        return;
      }
      
      let response;
      if (isSuperLike) {
        response = await superlikeUser(currentUser.id);
      } else {
        response = await likeUser(currentUser.id);
      }
      
      // 只有在没有取消喜欢的情况下才添加到已点赞列表
      if (!response.unliked) {
        setLikedUsers(prev => new Set([...prev, currentUser.id]));
      }
    } catch (error) {
      console.error('Like operation failed:', error);
    }
  };

  /**
   * 处理收藏操作 - 支持状态切换
   */
  const handleAddToFavorites = async () => {
    if (!currentUser) return;
    
    const isCurrentlyFavorited = favoritedUsers.has(currentUser.id);
    
    try {
      if (isCurrentlyFavorited) {
        // 取消收藏
        await unfavoriteUser(currentUser.id);
        setFavoritedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentUser.id);
          return newSet;
        });
        console.log('Removed from favorites:', currentUser.name);
      } else {
        // 添加收藏
        await favoriteUser(currentUser.id);
        setFavoritedUsers(prev => new Set([...prev, currentUser.id]));
        console.log('Added to favorites:', currentUser.name);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  /**
   * 处理聊天按钮点击 - 创建聊天室并跳转到聊天页面
   */
  const handleChat = async (user: User) => {
    if (creatingChatRooms.has(user.id)) return;
    
    setCreatingChatRooms(prev => new Set(prev).add(user.id));
    
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
      setCreatingChatRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };



  const handlePass = () => {
    if (currentUserIndex < (recommendedUsers.length || users.length) - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    }
  };

  const handleSaveMatchCriteria = (criteria: MatchCriteria) => {
    setMatchCriteria(criteria);
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

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'excellent': return 'text-green-400';
      case 'high': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-slate-400';
    }
  };

  // Generate gradient background color based on username
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500', 
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500',
      'from-orange-500 to-red-500',
      'from-cyan-500 to-blue-500',
      'from-emerald-500 to-teal-500',
      'from-rose-500 to-pink-500'
    ];
    
    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  const renderCardView = () => {
    // 显示加载状态
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center pb-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">正在寻找匹配的人...</p>
          </div>
        </div>
      );
    }

    // 显示空状态
    if (!currentUser) {
      return (
        <div className="flex-1 flex items-center justify-center pb-16">
          <div className="text-center px-8">
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无更多用户</h3>
            <p className="text-slate-400 mb-6">请稍后再试，或者调整您的匹配偏好</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              刷新
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col pb-16 overflow-hidden">
        {/* Card Area */}
        <div className="flex-1 p-4 flex items-center justify-center min-h-0 overflow-hidden">
          <div 
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative bg-slate-700 cursor-pointer" 
            style={{ height: 'calc(100vh - 320px)' }}
            onClick={() => currentUser && navigate(`/profile/${currentUser.id}`)}
          >
            {currentUser.photos && currentUser.photos.length > 0 && !failedImages.has(currentUser.id) ? (
              <img
                src={currentUser.photos[0]}
                alt={currentUser.name}
                className="w-full h-full object-cover"
                onError={() => handleImageError(currentUser.id)}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(currentUser.name)} flex items-center justify-center`}>
                <span className="text-8xl font-bold text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h2 className="text-3xl font-bold mr-2">{currentUser.name}, {currentUser.age}</h2>
                  {currentUser.isVerified && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  )}
                </div>
                
                {/* Compatibility Score */}
                {currentUser.matchScore && (
                  <div className="flex items-center">
                    <TrendingUp size={16} className="mr-1" />
                    <span className={`text-sm font-semibold ${getCompatibilityColor(currentUser.matchScore.compatibility)}`}>
                      {currentUser.matchScore.score}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center mb-3">
                <MapPin size={16} className="mr-1 text-slate-300" />
                <span className="text-slate-300 text-sm">{currentUser.location}</span>
              </div>
              
              <p className="text-sm text-slate-200 leading-relaxed mb-4">
                {currentUser.bio}
              </p>
              
              {/* Match Reasons */}
              {currentUser.matchScore && currentUser.matchScore.reasons.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-green-400 mb-1">✨ Why we matched:</p>
                  <div className="flex flex-wrap gap-1">
                    {currentUser.matchScore.reasons.slice(0, 2).map((reason, index) => (
                      <span
                        key={index}
                        className="bg-green-500/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-green-300 border border-green-500/30"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.slice(0, 3).map((interest) => (
                  <span
                    key={interest}
                    className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white border border-white/30"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4">
          <div className="flex justify-center items-center space-x-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePass();
              }}
              className="w-16 h-16 bg-slate-700/80 backdrop-blur-sm rounded-full flex items-center justify-center text-red-400 hover:bg-slate-600 transition-all duration-200 shadow-lg hover:scale-105"
              title="跳过"
            >
              <X size={28} />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToFavorites();
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                currentUser && favoritedUsers.has(currentUser.id)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110'
                  : 'bg-slate-700/80 backdrop-blur-sm text-purple-400 hover:bg-slate-600'
              }`}
              title={currentUser && favoritedUsers.has(currentUser.id) ? "取消收藏" : "添加到收藏"}
            >
              <Star size={22} className={currentUser && favoritedUsers.has(currentUser.id) ? 'fill-current' : ''} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(false);
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                currentUser && likedUsers.has(currentUser.id)
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                  : 'bg-slate-700/80 backdrop-blur-sm text-green-400 hover:bg-slate-600'
              } hover:scale-105`}
              title={currentUser && likedUsers.has(currentUser.id) ? "取消喜欢" : "喜欢"}
            >
              <Heart size={28} className={currentUser && likedUsers.has(currentUser.id) ? 'fill-current' : ''} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChat(currentUser);
              }}
              disabled={currentUser && creatingChatRooms.has(currentUser.id)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                currentUser && creatingChatRooms.has(currentUser.id)
                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-700/80 backdrop-blur-sm text-blue-400 hover:bg-slate-600'
              }`}
              title="开始聊天"
            >
              {currentUser && creatingChatRooms.has(currentUser.id) ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <MessageCircle size={22} />
              )}
            </button>

          </div>
        </div>
      </div>
    );
  };

  const renderGridView = () => {
    // 显示加载状态
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center pb-16">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">正在加载用户...</p>
          </div>
        </div>
      );
    }

    // 显示空状态
    if (!users || users.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center pb-16">
          <div className="text-center px-8">
            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid3X3 size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">暂无用户数据</h3>
            <p className="text-slate-400 mb-6">请稍后再试，或者检查网络连接</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-4 pb-16" style={{ overflow: 'hidden' }}>
        <div className="h-full" style={{ overflowY: 'scroll', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="grid grid-cols-2 gap-4">
            {users.map((user) => (
            <div
              key={user.id}
              className="relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer hover:scale-105 transition-transform duration-200 shadow-lg"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              {user.photos && user.photos.length > 0 && !failedImages.has(user.id) ? (
                <img
                  src={user.photos[0]}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(user.id)}
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${getAvatarGradient(user.name)} flex items-center justify-center relative`}>
                  <span className="text-6xl font-bold text-white drop-shadow-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {/* Add subtle texture effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10"></div>
                </div>
              )}
              
              {/* Gradient mask - apply to all cards */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Top badges */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                <span className="text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-white border border-white/20">
                  ♎ Libra
                </span>
                {user.isVerified && (
                  <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded font-bold text-white shadow-lg">
                    VIP
                  </span>
                )}
              </div>
              
              {/* User info */}
              <div className="absolute bottom-2 left-2 right-2 text-white">
                <h3 className="font-semibold text-sm mb-1 drop-shadow-md">{user.name}</h3>
                <p className="text-xs opacity-90 mb-2 drop-shadow-sm">{user.age} • {user.location}</p>
                
                {/* Interests */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {user.interests.slice(0, 2).map((interest) => (
                    <span
                      key={interest}
                      className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/30"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="absolute bottom-2 right-2 flex space-x-1">
                <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleFavorite(user);
                   }}
                   className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                 >
                   <Star size={12} />
                 </button>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleChat(user);
                   }}
                   disabled={creatingChatRooms.has(user.id)}
                   className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                     creatingChatRooms.has(user.id)
                       ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                       : 'bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30'
                   }`}
                 >
                   {creatingChatRooms.has(user.id) ? (
                     <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                   ) : (
                     <MessageCircle size={12} />
                   )}
                 </button>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handleLike(user);
                   }}
                   className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                 >
                   <Heart size={12} />
                 </button>
              </div>
            </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ScreenContainer>
      {/* Compact Top Navigation */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <button
          onClick={() => navigate('/my-profile')}
          className="text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <User size={24} />
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-slate-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowMatchSettings(true)}
            className="text-slate-400 hover:text-indigo-400 transition-colors"
            title="Match Preferences"
          >
            <Filter size={20} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Compact View Toggle */}
      <div className="px-4 py-2">
        <div className="flex justify-center p-1 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'cards'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
            }`}
          >
            <Layers size={16} className="mr-2" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-600/50'
            }`}
          >
            <Grid3X3 size={16} className="mr-2" />
            Grid
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'cards' ? renderCardView() : renderGridView()}

      {/* Match Settings Modal */}
      {showMatchSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="w-full max-w-md h-full max-h-[90vh] bg-slate-900 rounded-t-2xl overflow-hidden">
            <MatchSettings
              onBack={() => setShowMatchSettings(false)}
              onSave={handleSaveMatchCriteria}
              initialCriteria={matchCriteria}
            />
          </div>
        </div>
      )}

      <BottomNav />
    </ScreenContainer>
  );
};

export default DiscoveryScreen;