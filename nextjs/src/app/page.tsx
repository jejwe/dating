'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import Button from '@/components/Common/Button';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <ScreenContainer className="bg-slate-900">
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8">
          <Heart size={48} className="text-white" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">SoulMate</h1>
        <p className="text-slate-400 mb-12 text-lg">Find your perfect match.</p>

        <div className="w-full space-y-4">
          <Button
            fullWidth
            onClick={() => router.push('/signup')}
          >
            Create Account
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => router.push('/login')}
          >
            Sign In
          </Button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-indigo-400">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-indigo-400">Privacy Policy</a>.
        </p>
      </div>
    </ScreenContainer>
  );
};

export default WelcomeScreen;
