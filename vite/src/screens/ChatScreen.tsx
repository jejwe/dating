import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Paperclip, Send, Image } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import Avatar from '../components/Common/Avatar';
import { useChatRoom } from '../hooks/useChatRoom';

const ChatScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { chatRoom, messages, loading, error, sendMessage, sendImageMessage, isPolling } = useChatRoom(id);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  if (loading) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </ScreenContainer>
    );
  }

  if (error || !chatRoom) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">{error || 'Chat not found'}</p>
        </div>
      </ScreenContainer>
    );
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessage(newMessage.trim());
        setNewMessage('');
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('图片文件大小不能超过5MB');
      return;
    }

    setIsUploading(true);
    try {
      await sendImageMessage(file);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Failed to send image:', err);
      alert('图片发送失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getDateLabel = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (messageDate.getTime() === today.getTime()) {
        return '今天';
      } else if (messageDate.getTime() === yesterday.getTime()) {
        return '昨天';
      } else {
        return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const dateLabel = getDateLabel(message.created_at);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(message);
    });
    
    return Object.entries(groups).map(([dateLabel, groupMessages]) => ({
      dateLabel,
      messages: groupMessages
    }));
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors mr-3"
        >
          <ChevronLeft size={20} />
        </button>
        <Avatar
          src={chatRoom?.otherUser?.photos?.[0]}
          name={chatRoom?.otherUser?.name || 'Unknown'}
          size="sm"
          className="mr-2"
        />
        <div className="flex-grow">
          <span className="font-semibold text-slate-200">{chatRoom?.otherUser?.name || '加载中...'}</span>
          {/* 实时更新状态指示器 */}
          <div className="flex items-center mt-1">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isPolling ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
            }`}></div>
            <span className="text-xs text-slate-400">
              {isPolling ? '实时更新中' : '离线'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-900">
        {groupMessagesByDate(messages).map((group) => (
          <div key={group.dateLabel}>
            <div className="text-center text-xs text-slate-500 my-2">{group.dateLabel}</div>
            {group.messages.map((message) => {
          // 系统消息特殊渲染
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex justify-center my-2">
                <div className="bg-slate-700/50 px-3 py-1 rounded-full">
                  <p className="text-xs text-slate-400 text-center">{message.content}</p>
                </div>
              </div>
            );
          }
          
          // 普通消息渲染
          return (
            <div key={message.id} className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.is_own
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-300 rounded-bl-sm'
                }`}
              >
                {message.type === 'image' && message.image_url ? (
                  <div className="space-y-2">
                    <img 
                      src={message.image_url} 
                      alt="图片消息" 
                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.image_url, '_blank')}
                      style={{ maxHeight: '200px', objectFit: 'cover' }}
                    />
                    <p className="text-xs">{message.content}</p>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${message.is_own ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
            </div>
          );
            })}
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleImageButtonClick}
            disabled={isUploading}
            className="text-slate-400 hover:text-indigo-400 transition-colors p-2 disabled:opacity-50"
            title="发送图片"
          >
            {isUploading ? (
              <div className="animate-spin">
                <Paperclip size={20} />
              </div>
            ) : (
              <Image size={20} />
            )}
          </button>
          
          {/* 隐藏的文件输入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isUploading}
            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-full text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isUploading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        
        {/* 上传状态提示 */}
        {isUploading && (
          <div className="mt-2 text-center">
            <p className="text-sm text-indigo-400">正在上传图片...</p>
          </div>
        )}
      </div>


    </ScreenContainer>
  );
};

export default ChatScreen;