'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/lib/api';

// --- INTERFACES ---
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

export interface Match {
  id: string;
  user: User;
  match_score: number;
  chat_room_id?: string;
  last_message_at?: string;
  created_at: string;
}

export interface Message {
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

export interface Moment {
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

export interface ChatRoom {
  id: string | number;
  otherUser: {
    id: string | number;
    name: string;
    photos: string[];
    age?: number;
    is_verified: boolean;
    is_online?: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string | number;
    isFromCurrentUser?: boolean;
  };
  last_message_time?: string;
  unread_count: number;
  status?: string;
}

// --- CONTEXT TYPE ---
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
  updateUserProfile: (userData: any) => Promise<void>;
  getDiscoverUsers: () => Promise<void>;
  getUserById: (userId: string) => Promise<User | null>;
  likeUser: (userId: string) => Promise<any>;
  superlikeUser: (userId: string) => Promise<any>;
  unlikeUser: (userId: string) => Promise<void>;
  skipUser: (userId: string) => Promise<void>;
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

// --- PROVIDER COMPONENT ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [moments, setMoments] = useState<Moment[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [comments, setComments] = useState<{ [momentId: string]: Comment[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // --- HELPER FUNCTIONS ---
  const saveAuthState = (user: User | null, authenticated: boolean) => {
    if (typeof window !== 'undefined') {
      const authState = {
        isAuthenticated: authenticated,
        currentUser: user,
        timestamp: Date.now()
      };
      localStorage.setItem('auth_state', JSON.stringify(authState));
    }
  };

  const clearAuthState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_state');
      localStorage.removeItem('auth_token');
    }
  };

  // --- CORE LOGIC ---
  useEffect(() => {
    const initializeApp = async () => {
      setIsAuthLoading(true);
      if (typeof window === 'undefined') {
        setIsAuthLoading(false);
        return;
      }

      apiService.initializeTokenFromStorage();

      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await loadCurrentUser();
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('App initialization failed:', err);
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
      if (typeof window !== 'undefined') {
        // This is a hard redirect, suitable for session expiry.
        // A soft navigation could be used if the router was available here.
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.login(email, password);
      if (!response.user || !response.token) {
        throw new Error('Login response data incomplete');
      }
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      saveAuthState(response.user, true);
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      clearAuthState();
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
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed');
      clearAuthState();
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
    setComments({});
    clearAuthState();
  };

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

  const getDiscoverUsers = async () => {
    try {
      const response = await apiService.getDiscoverUsers();
      setUsers(response.users || []);
    } catch (err) {
      console.error('Failed to get discover users:', err);
      setUsers([]);
      throw err;
    }
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const response = await apiService.getUserById(userId);
      return response.user || null;
    } catch (err) {
      console.error('Failed to get user by ID:', err);
      return null;
    }
  };

  const likeUser = async (userId: string) => {
    try {
      const response = await apiService.likeUser(userId);
      if (response.is_match) {
        await getMatches();
      }
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

  const getMatches = async () => {
    try {
      const response = await apiService.getMatches();
      setMatches(response.matches);
    } catch (err) {
      console.error('Failed to get matches:', err);
      throw err;
    }
  };

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

  const deleteComment = async (momentId: string, commentId: string) => {
    try {
      await apiService.deleteMomentComment(commentId);
      setComments(prev => ({
        ...prev,
        [momentId]: (prev[momentId] || []).filter(c => c.id !== commentId),
      }));
      setMoments(prev => prev.map(moment =>
        moment.id === momentId
          ? { ...moment, comments: Math.max(0, (moment.comments || 0) - 1) }
          : moment
      ));
    } catch (err) {
      console.error('AppContext: Failed to delete comment:', err);
      throw err;
    }
  };

  const deleteMoment = async (momentId: string) => {
    try {
      await apiService.deleteMoment(momentId);
      setMoments(prev => prev.filter(moment => moment.id !== momentId));
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

  const getChatRooms = async () => {
    try {
      const response = await apiService.getChatRooms();
      const mappedRooms = response.rooms.map((room: any) => ({
        ...room,
        id: room.id,
        otherUser: {
          ...(room.user || room.otherUser),
          id: (room.user || room.otherUser)?.id
        },
        user: undefined
      }));
      setChatRooms(mappedRooms);
    } catch (err) {
      console.error('Failed to get chat rooms:', err);
      setChatRooms([]);
      throw err;
    }
  };

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
      setMessages(prev => ({
        ...prev,
        [roomId]: [...(prev[roomId] || []), response.data]
      }));
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

  const value = {
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
    updateUserProfile,
    getDiscoverUsers,
    getUserById,
    likeUser,
    superlikeUser,
    unlikeUser,
    skipUser,
    getMatches,
    getMoments,
    likeMoment,
    unlikeMoment,
    createMoment,
    getChatRooms,
    getChatRoomById,
    getMessages,
    sendMessage,
    getCommentsForMoment,
    postComment,
    deleteComment,
    deleteMoment,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
