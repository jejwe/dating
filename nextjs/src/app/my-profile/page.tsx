'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Eye, CreditCard, Settings, User, Calendar, Edit3, X, Loader2 } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import BottomNav from '@/components/Navigation/BottomNav';
import Avatar from '@/components/Common/Avatar';
import { useAppContext } from '@/context/AppContext';

// This modal could be a separate component, but is kept inline for simplicity of conversion
const EditModal: React.FC<any> = ({ isOpen, title, value, onClose, onSave, type = 'text' }) => {
  const [editValue, setEditValue] = useState(value);
  useEffect(() => { setEditValue(value); }, [value, isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-sm">
        <h3 className="text-lg p-4">{title}</h3>
        <div className="p-4">
          <input type={type} value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full p-3 bg-slate-700 rounded-lg" />
        </div>
        <div className="flex space-x-3 p-4">
          <button onClick={onClose} className="flex-1 py-2 bg-slate-700 rounded-lg">Cancel</button>
          <button onClick={() => onSave(editValue)} className="flex-1 py-2 bg-indigo-600 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
};

const MyProfileScreenPage: React.FC = () => {
  const router = useRouter();
  const { currentUser, updateUserProfile } = useAppContext();
  const [isLoading, setIsLoading] = useState(!currentUser);
  const [editModal, setEditModal] = useState({ isOpen: false, field: '', title: '', value: '' });

  useEffect(() => {
    if (currentUser) setIsLoading(false);
  }, [currentUser]);

  const handleSave = async (value: string) => {
    if (!currentUser) return;
    const { field } = editModal;
    const updateData = { [field]: value };
    await updateUserProfile(updateData);
    setEditModal({ isOpen: false, field: '', title: '', value: '' });
  };

  if (isLoading || !currentUser) {
    return <ScreenContainer><div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div></ScreenContainer>;
  }

  const profileItems = [
    { field: 'name', title: 'Name', value: currentUser.name, icon: <User size={20} /> },
    { field: 'bio', title: 'Bio', value: currentUser.bio, icon: <Edit3 size={20} /> },
    { field: 'birthday', title: 'Birthday', value: '1990-01-01', icon: <Calendar size={20} /> },
  ];

  return (
    <ScreenContainer>
      <div className="p-3 text-center"><h1 className="text-base font-semibold">My Profile</h1></div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center mb-6">
          <Avatar src={currentUser.photos?.[0]} name={currentUser.name} size="lg" className="mr-4" />
          <div>
            <h2 className="text-xl font-bold">{currentUser.name}</h2>
            <p className="text-sm text-slate-400">{currentUser.bio}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <button onClick={() => router.push('/my-likes')} className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg"><Heart size={24} /><span className="text-xs mt-1">My Likes</span></button>
          <button className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg"><Eye size={24} /><span className="text-xs mt-1">Visitors</span></button>
          <button className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg"><CreditCard size={24} /><span className="text-xs mt-1">Wallet</span></button>
          <button onClick={() => router.push('/settings')} className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg"><Settings size={24} /><span className="text-xs mt-1">Settings</span></button>
        </div>

        <div className="space-y-1">
          {profileItems.map(item => (
            <button key={item.field} onClick={() => setEditModal({isOpen: true, ...item})} className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center">{item.icon}<span className="ml-3">{item.title}</span></div>
              <div className="flex items-center"><span className="text-slate-400 mr-2">{item.value}</span><span>›</span></div>
            </button>
          ))}
        </div>
      </div>
      <EditModal {...editModal} onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))} onSave={handleSave} />
      <BottomNav />
    </ScreenContainer>
  );
};

export default MyProfileScreenPage;
