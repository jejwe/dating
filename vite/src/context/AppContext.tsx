import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  photos: string[];
  bio: string;
  interests: string[];
  location: string;
  gender?: string;
  is_verified?: boolean;
  is_vip?: boolean;
  is_online?: boolean;
  occupation?: string;
  education?: string;
  zodiac_sign?: string;
}

interface Match {
  id: string;
  user: User;
  match_score: number;
  chat_room_id?: string;
  last_message_at?: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'emoji' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  is_own: boolean;
  sender_name?: string;
  sender_photos?: string[];
}

interface Moment {
  id: string;
  user: User;
  content: string;
  images?: string[];
  location?: string;
  hashtags?: string[];
  audience: 'public' | 'friends' | 'private';
  likes: number;
  comments: number;
  shares: number;
  created_at: string;
  is_liked: boolean;
  comments_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  parent_comment_id: string | null;
}

interface ChatRoom {
  id: string | number; // 支持数字和字符串类型
  otherUser: {
    id: string | number; // 支持数字和字符串类型
    name: string;
    photos: string[];
    age?: number;
    is_verified: boolean;
    is_online?: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string | number; // 支持数字和字符串类型
    isFromCurrentUser?: boolean;
  };
  last_message_time?: string;
  unread_count: number;
  status?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  matches: Match[];
  moments: Moment[];
  chatRooms: ChatRoom[];
  messages: { [chatId: string]: Message[] };
  comments: { [momentId: string]: Comment[] };
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshData: () => Promise<void>;
  manualRefreshData: () => Promise<void>;
  updateUserProfile: (userData: any) => Promise<void>;
  getDiscoverUsers: () => Promise<void>;
  getUserById: (userId: string) => Promise<User | null>;
  likeUser: (userId: string) => Promise<any>;
  superlikeUser: (userId: string) => Promise<any>;
  unlikeUser: (userId: string) => Promise<void>;
  skipUser: (userId: string) => Promise<void>;
  addMatch: (user: User) => void;
  favoriteUser: (userId: string) => Promise<void>;
  unfavoriteUser: (userId: string) => Promise<void>;
  getUserActions: (targetId?: string) => Promise<{ favorites: any[]; likedUsers: any[] }>;
  undoLastAction: () => Promise<any>;
  getMatches: () => Promise<void>;
  getMoments: () => Promise<void>;
  likeMoment: (momentId: string) => Promise<void>;
  unlikeMoment: (momentId: string) => Promise<void>;
  createMoment: (momentData: any) => Promise<void>;
  getChatRooms: () => Promise<void>;
  getChatRoomById: (roomId: string) => ChatRoom | null;
  getMessages: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  getCommentsForMoment: (momentId: string) => Promise<void>;
  postComment: (momentId: string, content: string, parentCommentId?: string | null) => Promise<void>;
  deleteComment: (momentId: string, commentId: string) => Promise<void>;
  deleteMoment: (momentId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // 初始化为空数组
  const [matches, setMatches] = useState<Match[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [comments, setComments] = useState<{ [momentId: string]: Comment[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false); // 添加数据初始化标记
  const [currentPath, setCurrentPath] = useState(window.location.pathname); // 添加路径状态追踪

  // Initialize data
  useEffect(() => {
    const initializeApp = async () => {
      setIsAuthLoading(true);
      try {
        // 首先从localStorage恢复认证状态
        const storedAuthState = localStorage.getItem('auth_state');
        const token = localStorage.getItem('auth_token');
        
        if (storedAuthState && token) {
          const { isAuthenticated: storedIsAuth, currentUser: storedUser } = JSON.parse(storedAuthState);
          setIsAuthenticated(storedIsAuth);
          if (storedUser) {
            setCurrentUser(storedUser);
          }
          // 有token时验证服务器状态
          await loadCurrentUser();
        } else if (token) {
          // 只有token没有状态，进行验证
          await loadCurrentUser();
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('App initialization failed:', err);
        setError('App initialization failed');
        // Ensure state is cleared on initialization failure
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearAuthState();
        apiService.clearToken();
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeApp();
  }, []);

  // 保存认证状态到localStorage
  const saveAuthState = (user: User | null, authenticated: boolean) => {
    const authState = {
      isAuthenticated: authenticated,
      currentUser: user,
      timestamp: Date.now()
    };
    localStorage.setItem('auth_state', JSON.stringify(authState));
  };

  // 清除认证状态
  const clearAuthState = () => {
    localStorage.removeItem('auth_state');
    setIsAuthenticated(false);
  };

  // 路径变化监听 - 检测路径变化并重置数据初始化状态
  useEffect(() => {
    /**
     * 监听路径变化的函数
     * 当路径发生变化时，重置dataInitialized标记以确保数据能够重新加载
     */
    const handlePathChange = () => {
      const newPath = window.location.pathname;
      const previousPath = currentPath;
      
      // 定义需要数据初始化的页面
      const dataPages = ['/discovery', '/discover', '/moments', '/messages'];
      const wasDataPage = dataPages.includes(previousPath);
      const isDataPage = dataPages.includes(newPath);
      
      // 如果路径发生变化且涉及数据页面，重置数据初始化标记
      if (previousPath !== newPath && (isDataPage || wasDataPage)) {
        console.log(`🔄 路径变化: ${previousPath} -> ${newPath}, 重置数据初始化标记`);
        setDataInitialized(false);
      }
      
      setCurrentPath(newPath);
    };

    // 监听popstate事件（浏览器前进后退）
    window.addEventListener('popstate', handlePathChange);
    
    // 监听pushstate和replacestate（程序化导航）
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handlePathChange();
    };
    
    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handlePathChange();
    };

    return () => {
      window.removeEventListener('popstate', handlePathChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [currentPath, dataInitialized]);

  // 数据初始化 - 在AppContext中作为备用机制，主要依靠组件自身的数据加载
  useEffect(() => {
    const initializeData = async () => {
      // 检查当前路径是否需要这些数据（作为备用机制）
      const needsDataInitialization = [
        '/discovery',
        '/discover'
      ].includes(currentPath); // 只在discovery页面自动初始化，其他页面由组件自己管理

      if (currentUser && !isAuthLoading && !loading && !dataInitialized && needsDataInitialization) {
        console.log(`📊 AppContext数据初始化，当前路径: ${currentPath}`);
        setLoading(true);
        setError(null);
        
        try {
          // 只为discovery页面自动加载数据
          if (currentPath === '/discovery' || currentPath === '/discover') {
            console.log('🔄 获取用户列表...');
            await getDiscoverUsers();
          }
          
          setDataInitialized(true); // 标记数据已初始化
          console.log(`✅ AppContext数据初始化完成，当前路径: ${currentPath}`);
        } catch (err) {
          console.error('Failed to initialize data:', err);
          setError('Data initialization failed');
          // 失败后不要重试，避免无限循环
          setDataInitialized(true);
        } finally {
          setLoading(false);
        }
      }
    };

    // 防抖处理，避免频繁调用
    const timeoutId = setTimeout(initializeData, 100);
    return () => clearTimeout(timeoutId);
  }, [currentUser, isAuthLoading, dataInitialized, currentPath]); // 移除loading依赖避免循环

  // Load current user info
  const loadCurrentUser = async () => {
    setLoading(true);
    try {
      const response = await apiService.getCurrentUser();
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      saveAuthState(response.user, true);
    } catch (err) {
      console.error('Failed to load current user:', err);
      setIsAuthenticated(false);
      setCurrentUser(null);
      clearAuthState();
      apiService.clearToken();
      setDataInitialized(false); // 重置数据初始化标记
      // Redirect to login page if session expired
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data - 强制刷新数据
  const refreshData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        getDiscoverUsers(),
        getMatches(),
        getMoments(),
        getChatRooms()
      ]);
    } catch (err) {
      console.error('Failed to refresh data:', err);
      setError('Data refresh failed');
    } finally {
      setLoading(false);
    }
  };

  // 手动刷新数据 - 供用户主动调用
  const manualRefreshData = async () => {
    if (!currentUser) return;
    
    // 清空现有数据
    setUsers([]);
    setMatches([]);
    setMoments([]);
    setChatRooms([]);
    
    // 重新加载数据
    await refreshData();
    
    // 重置初始化标记，允许重新初始化
    setDataInitialized(false);
  };

  // User authentication
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.login(email, password);
      
      // Verify response contains necessary user info and token
      if (!response.user || !response.token) {
        throw new Error('Login response data incomplete');
      }
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      saveAuthState(response.user, true);
      // refreshData会通过useEffect自动调用
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      
      // Ensure existing user state is cleared on login failure
      setCurrentUser(null);
      setIsAuthenticated(false);
      clearAuthState();
      apiService.clearToken();
      setDataInitialized(false); // 重置数据初始化标记
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.register(userData);
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      saveAuthState(response.user, true);
      // refreshData会通过useEffect自动调用
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed');
      setIsAuthenticated(false);
      clearAuthState();
      setDataInitialized(false); // 重置数据初始化标记
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setUsers([]);
    setMatches([]);
    setMoments([]);
    setChatRooms([]);
    setMessages({});
    clearAuthState();
    setDataInitialized(false); // 重置数据初始化标记
  };

  // User profile management
  const updateUserProfile = async (userData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.updateUserProfile(userData);
      setCurrentUser(response.user);
    } catch (err) {
      console.error('Profile update failed:', err);
      setError('Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Discover users
  const getDiscoverUsers = async () => {
    try {
      const response = await apiService.getDiscoverUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to get discover users:', err);
      setUsers([]); // API失败时设置为空数组
      throw err;
    }
  };

  // Get user by ID
  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const response = await apiService.getUserById(userId);
      return response.user || null;
    } catch (err) {
      console.error('Failed to get user by ID:', err);
      return null;
    }
  };

  // Match operations
  const likeUser = async (userId: string) => {
    try {
      const response = await apiService.likeUser(userId);
      
      // If match successful, refresh match list
      if (response.is_match) {
        await getMatches();
      }
      
      // Don't remove user from discovery list for like/unlike operations
      // Only skip operation should remove users
      
      return response;
    } catch (err) {
      console.error('Like user failed:', err);
      throw err;
    }
  };

  const superlikeUser = async (userId: string) => {
    try {
      const response = await apiService.superlikeUser(userId);
      
      if (response.is_match) {
        await getMatches();
      }
      
      // Don't remove user from discovery list for superlike operations
      // Only skip operation should remove users
      
      return response;
    } catch (err) {
      console.error('Superlike user failed:', err);
      throw err;
    }
  };

  const unlikeUser = async (userId: string) => {
    try {
      await apiService.unlikeUser(userId);
    } catch (err) {
      console.error('Unlike user failed:', err);
      throw err;
    }
  };

  const skipUser = async (userId: string) => {
    try {
      await apiService.skipUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Skip user failed:', err);
      throw err;
    }
  };

  // Get match list
  const getMatches = async () => {
    try {
      const response = await apiService.getMatches();
      setMatches(response.matches);
    } catch (err) {
      console.error('Failed to get matches:', err);
      throw err;
    }
  };

  // Moment management
  const getMoments = async () => {
    try {
      const response = await apiService.getMoments(20, 0);
      setMoments(response.moments);
    } catch (err) {
      console.error('Failed to get moments:', err);
      throw err;
    }
  };

  const likeMoment = async (momentId: string) => {
    try {
      await apiService.likeMoment(momentId);
      setMoments(prev => prev.map(moment => 
        moment.id === momentId 
          ? { ...moment, is_liked: true, likes: moment.likes + 1 }
          : moment
      ));
    } catch (err) {
      console.error('Like moment failed:', err);
      throw err;
    }
  };

  const unlikeMoment = async (momentId: string) => {
    try {
      await apiService.unlikeMoment(momentId);
      setMoments(prev => prev.map(moment => 
        moment.id === momentId 
          ? { ...moment, is_liked: false, likes: Math.max(0, moment.likes - 1) }
          : moment
      ));
    } catch (err) {
      console.error('Unlike moment failed:', err);
      throw err;
    }
  };

  const createMoment = async (momentData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createMoment(momentData);
      setMoments(prev => [response.data, ...prev]);
    } catch (err) {
      console.error('Create moment failed:', err);
      setError('Failed to post moment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCommentsForMoment = async (momentId: string) => {
    try {
      const response = await apiService.getMomentComments(momentId);
      setComments(prev => ({
        ...prev,
        [momentId]: response.comments,
      }));
    } catch (err) {
      console.error(`Failed to get comments for moment ${momentId}:`, err);
    }
  };

  const postComment = async (momentId: string, content: string, parentCommentId: string | null = null) => {
    try {
      const response = await apiService.createMomentComment(momentId, content, parentCommentId);
      const newComment = response.comment;
      setComments(prev => ({
        ...prev,
        [momentId]: [...(prev[momentId] || []), newComment],
      }));
      setMoments(prev => prev.map(moment => 
        moment.id === momentId
          ? { ...moment, comments: (moment.comments || 0) + 1 }
          : moment
      ));
    } catch (err) {
      console.error('Failed to post comment:', err);
      throw err;
    }
  };

  /**
   * 删除评论函数 - AppContext层
   * @param momentId - 动态ID
   * @param commentId - 评论ID
   */
  const deleteComment = async (momentId: string, commentId: string) => {
    // 调试日志：AppContext层参数检查
    console.log('AppContext deleteComment called with:', { momentId, commentId });
    
    // 简化参数验证
    if (!commentId || commentId === 'undefined' || commentId === 'null') {
      console.error('AppContext: Invalid commentId:', commentId);
      throw new Error('Invalid comment ID');
    }
    
    if (!momentId || momentId === 'undefined' || momentId === 'null') {
      console.error('AppContext: Invalid momentId:', momentId);
      throw new Error('Invalid moment ID');
    }
    
    try {
      console.log('AppContext: Calling apiService.deleteMomentComment with commentId:', commentId);
      await apiService.deleteMomentComment(commentId);
      
      // 更新本地状态
      setComments(prev => ({
        ...prev,
        [momentId]: (prev[momentId] || []).filter(c => c.id !== commentId),
      }));
      setMoments(prev => prev.map(moment => 
        moment.id === momentId
          ? { ...moment, comments: Math.max(0, (moment.comments || 0) - 1) }
          : moment
      ));
      
      console.log('AppContext: Comment deleted successfully');
    } catch (err) {
      console.error('AppContext: Failed to delete comment:', err);
      throw err;
    }
  };

  const deleteMoment = async (momentId: string) => {
    try {
      await apiService.deleteMoment(momentId);
      setMoments(prev => prev.filter(moment => moment.id !== momentId));
      // Also remove comments for this moment
      setComments(prev => {
        const newComments = { ...prev };
        delete newComments[momentId];
        return newComments;
      });
    } catch (err) {
      console.error('Failed to delete moment:', err);
      throw err;
    }
  };

  // Chat room management
  const getChatRooms = async (otherUserId?: string) => {
    try {
      const response = await apiService.getChatRooms(otherUserId);
      // 映射数据结构，将user属性改为otherUser，并确保ID类型兼容
      const mappedRooms = response.rooms.map((room: any) => ({
        ...room,
        id: room.id, // 保持原始ID（可能是数字或字符串）
        otherUser: {
          ...(room.user || room.otherUser), // 兼容两种数据结构
          id: (room.user || room.otherUser)?.id // 保持原始ID类型
        },
        user: undefined // 移除原user属性避免混淆
      }));
      setChatRooms(mappedRooms);
    } catch (err) {
      console.error('Failed to get chat rooms:', err);
      setChatRooms([]); // API失败时设置为空数组
      throw err;
    }
  };

  const getChatRoomById = (roomId: string): ChatRoom | null => {
    // 支持数字和字符串类型的roomId，确保类型兼容
    return chatRooms.find(room => String(room.id) === String(roomId)) || null;
  };

  // 获取与特定用户的聊天室
  const getChatRoomsWithUser = async (otherUserId: string) => {
    try {
      console.log('获取与特定用户的聊天室:', otherUserId);
      const response = await apiService.getChatRooms(otherUserId);
      console.log('特定用户聊天室响应:', response);
      return response.rooms || [];
    } catch (err) {
      console.error('Failed to get chat rooms with user:', err);
      return [];
    }
  };

  // Message management
  const getMessages = async (roomId: string) => {
    try {
      const response = await apiService.getMessages(roomId);
      setMessages(prev => ({
        ...prev,
        [roomId]: response.messages
      }));
    } catch (err) {
      console.error('Failed to get messages:', err);
      throw err;
    }
  };

  const sendMessage = async (roomId: string, content: string) => {
    try {
      const response = await apiService.sendMessage(roomId, content);
      
      // Update message list
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), response.data]
      }));
      
      // Update last message time in match list
      setMatches(prev => prev.map(match => 
        match.chat_room_id === roomId 
          ? { ...match, last_message_at: new Date().toISOString() }
          : match
      ));
    } catch (err) {
      console.error('Send message failed:', err);
      throw err;
    }
  };

  // 收藏相关方法
  const favoriteUser = async (userId: string) => {
    try {
      await apiService.favoriteUser(userId);
    } catch (err) {
      console.error('Favorite user failed:', err);
      throw err;
    }
  };

  const unfavoriteUser = async (userId: string) => {
    try {
      await apiService.unfavoriteUser(userId);
    } catch (err) {
      console.error('Unfavorite user failed:', err);
      throw err;
    }
  };

  const getFavorites = async () => {
    try {
      const response = await apiService.getFavorites();
      return response.favorites;
    } catch (err) {
      console.error('Get favorites failed:', err);
      throw err;
    }
  };

  const getLikedUsers = async () => {
    try {
      const response = await apiService.getLikes();
      return response.likes;
    } catch (err) {
      console.error('Get liked users failed:', err);
      throw err;
    }
  };

  const getUserActions = async (targetId?: string) => {
    try {
      const response = await apiService.getUserActions(targetId);
      return response;
    } catch (err) {
      console.error('Get user actions failed:', err);
      throw err;
    }
  };

  // 使用 useCallback 来稳定函数引用
  const stableGetUserActions = React.useCallback(getUserActions, []);

  /**
   * 添加匹配用户到匹配列表
   * @param user - 要添加的用户对象
   */
  const addMatch = (user: User) => {
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      user: user,
      match_score: 85, // 默认匹配分数
      created_at: new Date().toISOString()
    };
    
    setMatches(prev => [newMatch, ...prev]);
  };

  // 撤销操作
  const undoLastAction = async () => {
    try {
      const response = await apiService.undoLastAction();
      return response.undone_action;
    } catch (err) {
      console.error('Undo action failed:', err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      matches,
      moments,
      chatRooms,
      messages,
      comments,
      loading,
      error,
      isAuthenticated,
      isAuthLoading,
      login,
      register,
      logout,
      refreshData,
      manualRefreshData,
      updateUserProfile,
      getDiscoverUsers,
      getUserById,
      likeUser,
      superlikeUser,
      unlikeUser,
      skipUser,
      addMatch,
      favoriteUser,
      unfavoriteUser,
      getUserActions: stableGetUserActions,
      getFavorites,
      getLikedUsers,
      undoLastAction,
      getMatches,
      getMoments,
      likeMoment,
      unlikeMoment,
      createMoment,
          getChatRooms,
    getChatRoomById,
    getChatRoomsWithUser,
      getMessages,
      sendMessage,
      getCommentsForMoment,
      postComment,
      deleteComment,
      deleteMoment
    }}>
      {children}
    </AppContext.Provider>
  );
};
