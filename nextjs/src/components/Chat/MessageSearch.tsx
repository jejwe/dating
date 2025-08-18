'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Filter, Clock, Star, Image, FileText } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

interface MessageSearchProps {
  onClose: () => void;
  onSelectMessage?: (chatId: string, messageId: string) => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ onClose, onSelectMessage }) => {
  const { matches, messages } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'images' | 'files'>('all');

  const allMessages = useMemo(() => {
    const results: Array<{
      chatId: string;
      chatName: string;
      message: any;
      relevanceScore: number;
    }> = [];

    Object.entries(messages).forEach(([chatId, chatMessages]) => {
      const match = matches.find(m => m.id === chatId);
      if (!match) return;

      chatMessages.forEach((message) => {
        if (searchTerm && message.text.toLowerCase().includes(searchTerm.toLowerCase())) {
          const relevanceScore = message.text.toLowerCase().indexOf(searchTerm.toLowerCase()) === 0 ? 2 : 1;
          results.push({
            chatId,
            chatName: match.user.name,
            message,
            relevanceScore
          });
        }
      });
    });

    return results.sort((a, b) => {
      // Sort by relevance first, then by timestamp
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return b.message.timestamp.getTime() - a.message.timestamp.getTime();
    });
  }, [searchTerm, messages, matches]);

  const filteredMessages = useMemo(() => {
    if (filterType === 'all') return allMessages;
    // For demo purposes, we'll just filter by message content
    return allMessages.filter(item => {
      if (filterType === 'images') return item.message.text.includes('📷') || item.message.text.includes('image');
      if (filterType === 'files') return item.message.text.includes('📎') || item.message.text.includes('file');
      return true;
    });
  }, [allMessages, filterType]);

  const formatMessageDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const truncateMessage = (text: string, maxLength: number = 60) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400 text-slate-900 px-0.5 rounded">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Search Messages</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
              autoFocus
            />
          </div>

          {/* Filter Options */}
          <div className="flex space-x-2 mt-3">
            {[
              { type: 'all', label: 'All', icon: null },
              { type: 'text', label: 'Text', icon: FileText },
              { type: 'images', label: 'Images', icon: Image },
              { type: 'files', label: 'Files', icon: FileText }
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filterType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {Icon && <Icon size={14} className="mr-1" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto">
          {searchTerm ? (
            filteredMessages.length > 0 ? (
              <div className="divide-y divide-slate-700">
                {filteredMessages.map((item) => (
                  <div
                    key={`${item.chatId}-${item.message.id}`}
                    onClick={() => {
                      onSelectMessage?.(item.chatId, item.message.id);
                      onClose();
                    }}
                    className="p-4 hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                          {item.chatName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{item.chatName}</h4>
                          <p className="text-xs text-slate-400">
                            {formatMessageDate(item.message.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Clock size={14} className="text-slate-400" />
                    </div>

                    <p className="text-sm text-slate-300 ml-11">
                      {highlightSearchTerm(truncateMessage(item.message.text))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search size={48} className="mb-4 opacity-50" />
                <p className="text-center">
                  {searchTerm.length > 2
                    ? 'No messages found'
                    : 'Type at least 3 characters to search'
                  }
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Search size={48} className="mb-4 opacity-50" />
              <p className="text-center">Search for messages across all conversations</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 bg-slate-800/50">
          <p className="text-xs text-slate-500 text-center">
            {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;
