import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface ChatRoom {
  id: string;
  otherUser: {
    id: string;
    name: string;
    photos: string[];
    age: number;
    is_verified: boolean;
    is_online?: boolean;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    isFromCurrentUser?: boolean;
  };
  last_message_time?: string;
  unread_count: number;
  status: string;
}

interface UseChatRoomsReturn {
  rooms: ChatRoom[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useChatRooms = (): UseChatRoomsReturn => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取聊天室列表
   * 将后端返回的user属性映射为otherUser以符合前端接口定义
   */
  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getChatRooms();
      
      // 映射数据结构，将user属性改为otherUser
      const mappedRooms = response.rooms.map((room: any) => ({
        ...room,
        otherUser: room.user || room.otherUser, // 兼容两种数据结构
        user: undefined // 移除原user属性避免混淆
      }));
      
      setRooms(mappedRooms);
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms
  };
};