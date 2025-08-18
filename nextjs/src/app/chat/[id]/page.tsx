'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Paperclip, Send, Image } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import Avatar from '@/components/Common/Avatar';
import { useChatRoom } from '@/hooks/useChatRoom';

const ChatScreenPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { chatRoom, messages, loading, error, sendMessage, sendImageMessage, isPolling } = useChatRoom(id);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await sendImageMessage(file);
    } catch (err) {
      console.error('Failed to send image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <ScreenContainer><div className="flex-1 flex items-center justify-center"><p>Loading...</p></div></ScreenContainer>;
  if (error || !chatRoom) return <ScreenContainer><div className="flex-1 flex items-center justify-center"><p>{error || 'Chat not found'}</p></div></ScreenContainer>;

  return (
    <ScreenContainer>
      <div className="bg-slate-800/80 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-3"><ChevronLeft size={20} /></button>
        <Avatar src={chatRoom?.otherUser?.photos?.[0]} name={chatRoom?.otherUser?.name || 'U'} size="sm" />
        <div className="ml-2">
            <span className="font-semibold text-white">{chatRoom?.otherUser?.name}</span>
            <div className={`text-xs ${isPolling ? 'text-green-400' : 'text-slate-500'}`}>{isPolling ? 'Online' : 'Offline'}</div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-900">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl ${message.is_own ? 'bg-indigo-600 text-white' : 'bg-slate-700'}`}>
              {message.type === 'image' && message.image_url ? (
                <img src={message.image_url} alt="image" className="max-w-full h-auto rounded-lg" />
              ) : <p>{message.content}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-700">
        <div className="flex items-center space-x-2">
          <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}><Image size={20} /></button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          <input
            type="text"
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-grow p-3 bg-slate-700 rounded-full"
            disabled={isUploading}
          />
          <button onClick={handleSendMessage} disabled={!newMessage.trim() || isUploading} className="p-3 bg-indigo-600 rounded-full"><Send size={16} /></button>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default ChatScreenPage;
