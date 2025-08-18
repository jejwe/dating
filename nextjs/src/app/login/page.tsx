'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import ScreenHeader from '@/components/Layout/ScreenHeader';
import Button from '@/components/Common/Button';
import Input from '@/components/Common/Input';
import Modal from '@/components/Common/Modal';
import { useAppContext } from '@/context/AppContext';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { login } = useAppContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push('/discovery');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed, please try again';
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError('');
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Sign In" showBack />

      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 bg-slate-600 border-slate-500 rounded focus:ring-indigo-500"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              />
              <span className="ml-2 text-sm text-slate-300">Remember me</span>
            </label>
            <a href="#" className="text-sm text-indigo-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative flex py-3 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-sm">Or sign in with</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Facebook
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              Google
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => router.push('/signup')}
              className="text-indigo-400 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>

      <Modal
        isOpen={showErrorModal}
        onClose={closeErrorModal}
        title="Login Failed"
      >
        <div className="text-center">
          <p className="text-slate-300 mb-6">{error}</p>
          <Button
            onClick={closeErrorModal}
            fullWidth
            variant="secondary"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </ScreenContainer>
  );
};

export default LoginScreen;
