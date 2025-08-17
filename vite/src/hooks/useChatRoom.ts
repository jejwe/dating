import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/api';
import { useAppContext } from '../context/AppContext';

/**
 * 聊天室信息接口
 */
interface ChatRoomInfo {
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
  };
  unread_count: number;
  status?: string;
}

/**
 * 消息接口
 */
interface Message {
  id: string | number; // 支持数字和字符串类型
  chat_room_id: string | number; // 支持数字和字符串类型
  sender_id: string | number; // 支持数字和字符串类型
  receiver_id: string | number; // 支持数字和字符串类型
  content: string;
  type: 'text' | 'emoji' | 'image' | 'system';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  created_at: string;
  is_own: boolean;
  sender_name?: string;
  image_url?: string;
}

/**
 * Hook返回值接口
 */
interface UseChatRoomReturn {
  chatRoom: ChatRoomInfo | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'emoji') => Promise<void>;
  sendImageMessage: (imageFile: File) => Promise<void>;
  isPolling: boolean;
}

/**
 * 获取特定聊天室信息和消息的Hook
 * @param roomId 聊天室ID
 * @returns 聊天室信息、消息列表和相关操作函数
 */
export const useChatRoom = (roomId: string | undefined): UseChatRoomReturn => {
  const { getChatRoomById, chatRooms, getChatRoomsWithUser, currentUser } = useAppContext();
  const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  // 用于存储定时器引用
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // 用于存储最后一次获取消息的时间戳
  const lastFetchTimeRef = useRef<number>(0);
  // 用于存储页面可见性状态
  const isPageVisibleRef = useRef<boolean>(true);

  /**
   * 消息去重函数
   * @param newMessages 新获取的消息列表
   * @param existingMessages 现有的消息列表
   * @returns 去重后的消息列表
   */
  const deduplicateMessages = useCallback((newMessages: Message[], existingMessages: Message[]): Message[] => {
    const existingIds = new Set(existingMessages.map(msg => msg.id));
    const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
    
    // 按创建时间排序
    const allMessages = [...existingMessages, ...uniqueNewMessages];
    return allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, []);

  /**
   * 检查页面可见性
   * @returns 页面是否可见
   */
  const isPageVisible = useCallback((): boolean => {
    return !document.hidden && document.visibilityState === 'visible';
  }, []);

  /**
   * 获取消息列表（用于轮询和初始化）
   * @param isPollingUpdate 是否为轮询更新（不显示loading状态）
   */
  const fetchMessages = async (isPollingUpdate: boolean = false) => {
    if (!roomId) {
      return;
    }

    try {
      // 轮询更新时不显示loading状态
      if (!isPollingUpdate) {
        setLoading(true);
      }
      setError(null);

      // 获取聊天室消息
      const messagesResponse = await apiService.getMessages(roomId);
      const newMessages = messagesResponse.messages || [];
      
      // 如果是轮询更新，进行消息去重
      if (isPollingUpdate) {
        setMessages(prevMessages => deduplicateMessages(newMessages, prevMessages));
      } else {
        setMessages(newMessages);
      }
      
      // 更新最后获取时间
      lastFetchTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      if (!isPollingUpdate) {
        setError(err instanceof Error ? err.message : '获取消息失败');
      }
    } finally {
      if (!isPollingUpdate) {
        setLoading(false);
      }
    }
  };

  /**
   * 初始化聊天室数据（从全局状态获取聊天室信息，只获取消息）
   */
  const initializeChatRoom = async () => {
    if (!roomId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 从全局状态获取聊天室信息，如果没有则直接从API获取
      let currentRoom = getChatRoomById(roomId);
      let messagesAlreadyFetched = false;
      let fetchedMessages: any[] = [];
      
      if (!currentRoom) {
        console.log('从全局状态未找到聊天室，直接获取聊天室消息来确定聊天室信息...');
        try {
          // 直接获取聊天室消息，服务器会验证权限并返回聊天室信息
          const messagesResponse = await apiService.getMessages(roomId);
          fetchedMessages = messagesResponse.messages || [];
          messagesAlreadyFetched = true;
          
          if (fetchedMessages.length > 0) {
            // 从消息中提取聊天室信息
            const firstMessage = fetchedMessages[0];
            const currentUserId = currentUser?.id;
            
            // 确定对方用户ID
            const otherUserId = firstMessage.sender_id === currentUserId 
              ? firstMessage.receiver_id 
              : firstMessage.sender_id;
            
            console.log('从消息中确定对方用户ID:', otherUserId);
            
            // 现在只获取与该特定用户的聊天室
            if (otherUserId) {
              const specificRooms = await getChatRoomsWithUser(String(otherUserId));
              console.log('特定用户聊天室响应:', specificRooms);
              
              // 从特定聊天室中找到当前聊天室
              const targetRoom = specificRooms.find((room: any) => 
                String(room.id) === String(roomId)
              );
              
              if (targetRoom) {
                currentRoom = {
                  ...targetRoom,
                  otherUser: targetRoom.user || targetRoom.otherUser
                };
                console.log('从特定聊天室API获取到目标聊天室:', currentRoom);
              }
            }
          } else {
            // 如果没有消息，fallback到获取所有聊天室
            console.log('没有消息，fallback到获取所有聊天室...');
            const roomsResponse = await apiService.getChatRooms();
            if (roomsResponse.rooms && roomsResponse.rooms.length > 0) {
              const targetRoom = roomsResponse.rooms.find((room: any) => 
                String(room.id) === String(roomId)
              );
              if (targetRoom) {
                currentRoom = {
                  ...targetRoom,
                  otherUser: targetRoom.user || targetRoom.otherUser
                };
                console.log('从fallback API成功获取到目标聊天室:', currentRoom);
              }
            }
          }
        } catch (apiError) {
          console.error('从API获取聊天室信息失败:', apiError);
        }
        
        if (!currentRoom) {
          setError('聊天室不存在或无权访问');
          setLoading(false);
          return;
        }
      }

      // 直接使用获取到的聊天室信息
      setChatRoom(currentRoom);

      // 如果还没有获取过消息，则获取消息
      if (!messagesAlreadyFetched) {
        const messagesResponse = await apiService.getMessages(roomId);
        fetchedMessages = messagesResponse.messages || [];
      }
      
      setMessages(fetchedMessages);
      
      // 更新最后获取时间
      lastFetchTimeRef.current = Date.now();
    } catch (err) {
      console.error('Failed to initialize chat room:', err);
      setError(err instanceof Error ? err.message : '初始化聊天室失败');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 启动消息轮询
   */
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current || !roomId) {
      return;
    }
    
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      // 只在页面可见时进行轮询，只获取消息
      if (isPageVisible() && isPageVisibleRef.current) {
        fetchMessages(true);
      }
    }, 3000); // 每3秒轮询一次
  }, [roomId, isPageVisible]);

  /**
   * 停止消息轮询
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  }, []);

  /**
   * 处理页面可见性变化
   */
  const handleVisibilityChange = useCallback(() => {
    const visible = isPageVisible();
    isPageVisibleRef.current = visible;
    
    if (visible && roomId) {
      // 页面变为可见时，立即获取一次消息并启动轮询
      fetchMessages(true);
      startPolling();
    } else {
      // 页面不可见时，停止轮询
      stopPolling();
    }
  }, [roomId, isPageVisible, startPolling, stopPolling]);

  /**
   * 发送消息
   * @param content 消息内容
   * @param type 消息类型
   */
  const sendMessage = async (content: string, type: 'text' | 'emoji' = 'text') => {
    if (!roomId || !content.trim()) {
      return;
    }

    try {
      await apiService.sendMessage(roomId, content, type);
      // 发送消息后立即获取最新消息列表
      await fetchMessages(true);
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  /**
   * 发送图片消息
   * @param imageFile 图片文件
   */
  const sendImageMessage = async (imageFile: File) => {
    if (!roomId) {
      return;
    }

    try {
      await apiService.sendImageMessage(roomId, imageFile);
      // 发送消息后立即获取最新消息列表
      await fetchMessages(true);
    } catch (err) {
      console.error('Failed to send image message:', err);
      throw err;
    }
  };

  // 监听全局聊天室状态变化，当聊天室数据加载完成后更新本地状态
  useEffect(() => {
    if (roomId && chatRooms.length > 0 && !chatRoom) {
      const currentRoom = getChatRoomById(roomId);
      if (currentRoom) {
        setChatRoom(currentRoom);
      }
    }
  }, [roomId, chatRooms, chatRoom, getChatRoomById]);

  // 初始化和roomId变化时的处理
  useEffect(() => {
    if (roomId) {
      initializeChatRoom();
      // 启动轮询
      startPolling();
    }
    
    return () => {
      // 清理定时器
      stopPolling();
    };
  }, [roomId, startPolling, stopPolling]);

  // 页面可见性监听
  useEffect(() => {
    // 添加页面可见性变化监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 添加窗口焦点变化监听器
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    
    return () => {
      // 清理监听器
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    chatRoom,
    messages,
    loading,
    error,
    isPolling,
    refetch: initializeChatRoom,
    sendMessage,
    sendImageMessage
  };
};