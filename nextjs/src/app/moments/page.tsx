'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, PlusCircle, Send, Trash2 } from 'lucide-react';
import ScreenContainer  from '@/components/Layout/ScreenContainer';
import BottomNav from '@/components/Navigation/BottomNav';
import Avatar from '@/components/Common/Avatar';
import LoadingSpinner  from '@/components/Common/LoadingSpinner';
import ImageGrid from '@/components/Moments/ImageGrid';
import { useAppContext } from '@/context/AppContext';

const MomentsScreenPage: React.FC = () => {
  const router = useRouter();
  const {
    currentUser, moments, comments, likeMoment, unlikeMoment,
    getCommentsForMoment, postComment, deleteComment, deleteMoment,
    getMoments, loading,
  } = useAppContext();

  const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    getMoments();
  }, [getMoments]);

  const handleLikeToggle = (moment: any) => {
    moment.is_liked ? unlikeMoment(moment.id) : likeMoment(moment.id);
  };

  const handleToggleComments = (momentId: string) => {
    if (activeMomentId === momentId) {
      setActiveMomentId(null);
    } else {
      setActiveMomentId(momentId);
      getCommentsForMoment(momentId);
    }
  };

  const handlePostComment = async (momentId: string) => {
    if (!newComment.trim()) return;
    await postComment(momentId, newComment.trim());
    setNewComment('');
  };

  const handleDeleteMoment = async (momentId: string) => {
    if (window.confirm('Are you sure?')) {
      await deleteMoment(momentId);
    }
  };

  if (loading && moments.length === 0) {
    return <ScreenContainer><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div><BottomNav /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <div className="bg-slate-800 p-3 flex items-center justify-center relative">
        <h1 className="text-base font-semibold text-white">Moments</h1>
        <button onClick={() => router.push('/create-moment')} className="absolute right-3 text-indigo-400"><PlusCircle size={22} /></button>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900 p-3 pb-16">
        {moments.map((moment) => (
          <div key={moment.id} className="bg-slate-800 rounded-xl mb-4">
            <div className="flex items-center p-3">
              <Avatar src={moment.user.photos[0]} name={moment.user.name} size="md" className="mr-3" />
              <div>
                <h4 className="font-semibold text-slate-100">{moment.user.name}</h4>
                <p className="text-xs text-slate-400">{new Date(moment.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="px-3 pb-3">
              <p className="text-slate-300 text-sm">{moment.content}</p>
              {moment.images && moment.images.length > 0 && <ImageGrid images={moment.images} />}
            </div>
            <div className="flex justify-around p-3 border-t border-slate-700">
              <button onClick={() => handleLikeToggle(moment)} className={`flex items-center space-x-1 ${moment.is_liked ? 'text-red-400' : 'text-slate-400'}`}>
                <Heart size={16} /> <span>{moment.likes}</span>
              </button>
              <button onClick={() => handleToggleComments(moment.id)} className="flex items-center space-x-1 text-slate-400">
                <MessageCircle size={16} /> <span>{moment.comments}</span>
              </button>
              {moment.user.id === currentUser?.id && (
                <button onClick={() => handleDeleteMoment(moment.id)} className="text-slate-400"><Trash2 size={16} /></button>
              )}
            </div>
            {activeMomentId === moment.id && (
              <div className="p-3 border-t border-slate-700">
                <div className="flex items-center mb-3">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-slate-700 rounded-full py-1 px-3 text-sm" />
                  <button onClick={() => handlePostComment(moment.id)} className="ml-2 text-indigo-400"><Send size={18} /></button>
                </div>
                {(comments[moment.id] || []).map((comment: any) => (
                  <div key={comment.id} className="flex items-start mt-2">
                    <Avatar src={comment.user.avatar} name={comment.user.name} size="sm" className="mr-2" />
                    <div className="flex-1 bg-slate-700 rounded-lg p-2">
                      <p className="text-sm text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <BottomNav />
    </ScreenContainer>
  );
};

export default MomentsScreenPage;
