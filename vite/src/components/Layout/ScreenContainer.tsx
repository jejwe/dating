import React, { ReactNode } from 'react';

interface ScreenContainerProps {
  children: ReactNode;
  className?: string;
}

const ScreenContainer: React.FC<ScreenContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`w-full min-h-screen bg-slate-800 shadow-2xl overflow-hidden flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default ScreenContainer;