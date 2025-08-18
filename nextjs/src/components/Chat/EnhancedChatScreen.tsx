'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Mic, MoreVertical, Check, CheckCheck, Clock, Plus } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface EnhancedChatScreenProps {
  chatId: string;
  onBack?: () => void;
}

interface MessageStatus {
  sent: boolean;
  delivered: boolean;
  read: boolean;
}

interface EnhancedMessage {
  id: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  type: 'text' | 'image' | 'voice' | 'location' | 'gif' | 'system';
  status?: MessageStatus;
  replyTo?: string;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

const EnhancedChatScreen: React.FC<EnhancedChatScreenProps> = ({ chatId, onBack }) => {
  const { matches, messages, addMessage } = useAppContext();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const match = matches.find(m => m.id === chatId);
  const chatMessages = (messages[chatId] || []).map(msg => ({
    ...msg,
    type: 'text' as const,
    status: {
      sent: true,
      delivered: msg.isOwn,
      read: msg.isOwn && Math.random() > 0.5
    }
  }));

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      addMessage(chatId, {
        id: Date.now().toString(),
        text: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true
      });
      setNewMessage('');

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDateLabel = (date: Date) => {
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
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach(message => {
      const dateLabel = getDateLabel(message.timestamp);
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

  const getMessageStatusIcon = (status?: MessageStatus) => {
    if (!status) return null;

    if (status.read) {
      return <CheckCheck size={14} className="text-blue-400" />;
    } else if (status.delivered) {
      return <CheckCheck size={14} className="text-slate-400" />;
    } else if (status.sent) {
      return <Check size={14} className="text-slate-400" />;
    }
    return <Clock size={14} className="text-slate-400" />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '✨'];

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Chat Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-indigo-400 hover:text-indigo-300 transition-colors mr-3"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {match?.user.name.charAt(0)}
              </div>
              {match?.user.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800"></div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-200">{match?.user.name}</h3>
              <p className="text-xs text-slate-400">
                {isTyping ? 'Typing...' : match?.user.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex space-x-3 text-slate-400">
          <button className="hover:text-indigo-400 transition-colors">
            📞
          </button>
          <button className="hover:text-indigo-400 transition-colors">
            📹
          </button>
          <button className="hover:text-indigo-400 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {groupMessagesByDate(chatMessages).map((group) => (
          <div key={group.dateLabel}>
            <div className="text-center text-xs text-slate-500 my-2">{group.dateLabel}</div>
            {group.messages.map((message) => {
          // 系统消息特殊渲染
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex justify-center my-2">
                <div className="bg-slate-700/50 px-3 py-1 rounded-full">
                  <p className="text-xs text-slate-400 text-center">{message.text}</p>
                </div>
              </div>
            );
          }

          // 普通消息渲染
          return (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                  message.isOwn
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-300 rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  message.isOwn ? 'text-indigo-100' : 'text-slate-500'
                }`}>
                  <span className="text-xs">{formatMessageTime(message.timestamp)}</span>
                  {message.isOwn && getMessageStatusIcon(message.status)}
                </div>
              </div>
            </div>
          );
            })}
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 border-t border-slate-700 bg-slate-800">
        {showEmojiPicker && (
          <div className="mb-2 p-2 bg-slate-700 rounded-lg">
            <div className="flex flex-wrap gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setNewMessage(prev => prev + emoji);
                    inputRef.current?.focus();
                  }}
                  className="text-xl hover:bg-slate-600 rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end space-x-2">
          <button className="text-slate-400 hover:text-indigo-400 transition-colors p-2">
            <Plus size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-full text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 text-sm pr-10"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <Smile size={18} />
            </button>
          </div>

          <button className="text-slate-400 hover:text-indigo-400 transition-colors p-2">
            <Paperclip size={20} />
          </button>

          {newMessage.trim() ? (
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              <Send size={16} />
            </button>
          ) : (
            <button className="text-slate-400 hover:text-indigo-400 transition-colors p-2">
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatScreen;
