'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, MoreHorizontal, Heart, Star, MessageCircle } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import { useAppContext, User } from '@/context/AppContext';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const ProfileViewScreenPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { users, getUserById, likeUser, favoriteUser } = useAppContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      setIsLoading(true);
      let foundUser = users.find(u => u.id === id);
      if (!foundUser) {
        foundUser = await getUserById(id);
      }
      setUser(foundUser);
      setIsLoading(false);
    };
    loadUser();
  }, [id, users, getUserById]);

  if (isLoading) return <ScreenContainer><div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div></ScreenContainer>;
  if (!user) return <ScreenContainer><div className="flex-1 flex items-center justify-center"><p>User not found.</p></div></ScreenContainer>;

  return (
    <ScreenContainer>
      <div className="relative bg-slate-800 p-4 flex items-center justify-center">
        <button onClick={() => router.back()} className="absolute left-4"><ChevronLeft /></button>
        <h1 className="text-lg font-semibold">{user.name}'s Profile</h1>
        <button className="absolute right-4"><MoreHorizontal /></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="h-80 bg-slate-700"><img src={user.photos?.[0]} alt={user.name} className="w-full h-full object-cover"/></div>
        <div className="p-4">
          <h1 className="text-2xl font-bold">{user.name}, {user.age}</h1>
          <p className="text-slate-400">{user.bio}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {user.interests.map(interest => <span key={interest} className="bg-indigo-800 text-indigo-100 px-3 py-1 rounded-full text-sm">{interest}</span>)}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-700 flex justify-around">
        <button onClick={() => favoriteUser(user.id)} className="p-4 bg-slate-700 rounded-full"><Star /></button>
        <button className="p-4 bg-slate-700 rounded-full"><MessageCircle /></button>
        <button onClick={() => likeUser(user.id)} className="p-4 bg-slate-700 rounded-full"><Heart /></button>
      </div>
    </ScreenContainer>
  );
};

export default ProfileViewScreenPage;
