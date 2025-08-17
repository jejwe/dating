import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import BottomNav from '../components/Navigation/BottomNav';
import Avatar from '../components/Common/Avatar';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorMessage from '../components/Common/ErrorMessage';
import { useRecentMatches } from '../hooks/useRecentMatches';
import { useAppContext } from '../context/AppContext';

const MessagesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { matches: recentMatches, loading: matchesLoading, error: matchesError, refetch: refetchMatches } = useRecentMatches(5);
  const { chatRooms, loading, error, getChatRooms, getMatches, currentUser } = useAppContext();
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // 确保在组件挂载或路由切换时加载数据
  useEffect(() => {
    const loadData = async () => {
      if (currentUser && !loading && (!chatRooms.length || !isDataLoaded)) {
        console.log('🔄 MessagesScreen: 加载消息数据');
        try {
          await Promise.all([
            getMatches(),
            getChatRooms()
          ]);
          setIsDataLoaded(true);
        } catch (error) {
          console.error('Failed to load messages data:', error);
        }
      }
    };

    loadData();
  }, [currentUser, loading, chatRooms.length, isDataLoaded, getMatches, getChatRooms]);

  /**
   * 格式化消息时间显示
   * @param dateString - 日期字符串
   * @returns 格式化后的时间字符串
   */
  const formatMessageTime = (dateString: string) => {
    // 验证日期字符串是否有效
    if (!dateString || dateString.trim() === '') {
      return '';
    }
    
    const date = new Date(dateString);
    
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'now';
    if (hours < 24) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleRetry = () => {
    refetchMatches();
    getChatRooms();
  };

  // Show loading state
  if (matchesLoading || loading) {
    return (
      <ScreenContainer className="bg-slate-900">
        <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center">
          <h1 className="text-base font-semibold text-slate-100">Messages</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading messages..." />
        </div>
        <BottomNav />
      </ScreenContainer>
    );
  }

  // Show error state
  if (matchesError || error) {
    return (
      <ScreenContainer className="bg-slate-900">
        <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center">
          <h1 className="text-base font-semibold text-slate-100">Messages</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <ErrorMessage 
            message={matchesError || error || 'Failed to load messages'} 
            onRetry={handleRetry}
          />
        </div>
        <BottomNav />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-slate-900">
      {/* Compact Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center">
        <h1 className="text-base font-semibold text-slate-100">Messages</h1>
      </div>
      
      {/* Compact Search */}
      <div className="px-3 py-2 bg-slate-900">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search matches..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 placeholder-slate-400 text-sm transition-all duration-200"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-16 bg-slate-900">
        {/* New Matches - more compact */}
        {recentMatches && recentMatches.length > 0 && (
          <div className="px-3 py-2">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">NEW MATCHES</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {recentMatches.map((match) => (
                <div 
                  key={`new-${match.id}`} 
                  className="flex flex-col items-center min-w-[60px] cursor-pointer group relative"
                  onClick={() => navigate(`/chat/${match.id}`)}
                >
                  <div className="relative mb-1.5">
                    <Avatar
                      src={match.user?.photos?.[0]}
                      name={match.user?.name || 'Unknown'}
                      size="md"
                      className="shadow-md group-hover:shadow-lg transition-shadow duration-200"
                    />
                    {match.is_new && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-slate-900"></div>
                    )}
                  </div>
                  <span className="text-xs text-slate-300 font-medium truncate w-14 text-center group-hover:text-white transition-colors">
                    {match.user?.name?.split(' ')[0] || 'Unknown'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations - completely remove hover background effect */}
        <div className="px-3 pt-1">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">CONVERSATIONS</h3>
          
          {chatRooms && chatRooms.length > 0 ? (
            chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => navigate(`/chat/${room.id}`)}
                className="flex items-center py-2.5 cursor-pointer group rounded-xl px-3 transition-all duration-200 mb-1"
              >
                                  <div className="mr-3">
                  <Avatar
                    src={room.otherUser?.photos?.[0]}
                    name={room.otherUser?.name || 'Unknown'}
                    size="md"
                    showOnlineStatus={true}
                    isOnline={room.otherUser?.is_online}
                    className="shadow-md group-hover:shadow-lg transition-shadow duration-200"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-semibold text-slate-200 text-base truncate group-hover:text-white transition-colors">
                      {room.otherUser?.name || 'Unknown'}
                    </h4>
                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-xs text-slate-500 font-medium whitespace-nowrap group-hover:text-slate-400 transition-colors">
                        {room.last_message_time ? formatMessageTime(room.last_message_time) : ''}
                      </span>
                      {(room.unread_count || 0) > 0 && (
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 truncate leading-relaxed group-hover:text-slate-300 transition-colors">
                    {room.last_message ? (
                      typeof room.last_message === 'string' ? 
                        room.last_message : 
                        room.last_message.content
                    ) : 'Start a conversation...'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No conversations yet</p>
              <p className="text-slate-500 text-xs mt-1">Start matching to begin chatting!</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </ScreenContainer>
  );
};

export default MessagesScreen;