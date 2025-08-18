'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Flame, Images, MessageCircle, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Flame, label: 'Discover', path: '/discover' },
    { icon: Images, label: 'Moments', path: '/moments' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: User, label: 'Profile', path: '/my-profile' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-md border-t border-slate-700 p-1.5 z-50">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = pathname === path;
          return (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs mt-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
