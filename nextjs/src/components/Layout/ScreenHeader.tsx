'use client';

import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ScreenHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: ReactNode;
  onBack?: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  showBack = false,
  rightElement,
  onBack
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center relative">
      {showBack && (
        <button
          onClick={handleBack}
          className="absolute left-3 text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="text-base font-semibold text-slate-100">{title}</h1>
      {rightElement && (
        <div className="absolute right-3">
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default ScreenHeader;
