import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ScreenContainer from '../components/Layout/ScreenContainer';
import ScreenHeader from '../components/Layout/ScreenHeader';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Modal from '../components/Common/Modal';
import { useAppContext } from '../context/AppContext';

const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
      // Navigate to the intended destination or default to discovery
      const from = location.state?.from?.pathname || '/discovery';
      navigate(from);
    } catch (err: unknown) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed, please try again';
      setError(errorMessage);
      setShowErrorModal(true);
      // Ensure no navigation on login failure
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
      
      <div className="flex-1 p-6">
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
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>
          
          <p className="text-xs text-slate-500 text-center">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-indigo-400 hover:underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={closeErrorModal}
        title="Login Failed"
      >
        <div className="text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/20">
              <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
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
