import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, X, Loader2 } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import ScreenHeader from '../components/Layout/ScreenHeader';
import { useAppContext } from '../context/AppContext';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, updateUserProfile } = useAppContext();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState(currentUser?.email || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * 处理用户登出
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * 保存邮箱修改
   */
  const handleSaveEmail = async () => {
    if (!emailValue.trim()) {
      setToast({ message: '邮箱不能为空', type: 'error' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setToast({ message: '请输入有效的邮箱地址', type: 'error' });
      return;
    }

    setIsUpdating(true);
    try {
      await updateUserProfile({ email: emailValue });
      setIsEditingEmail(false);
      setToast({ message: '邮箱更新成功', type: 'success' });
    } catch (error) {
      setToast({ message: '邮箱更新失败', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 取消邮箱编辑
   */
  const handleCancelEdit = () => {
    setEmailValue(currentUser?.email || '');
    setIsEditingEmail(false);
  };

  // 自动隐藏toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <ScreenContainer>
      <ScreenHeader title="Settings" showBack />

      <div className="flex-1 p-4 divide-y divide-slate-700">
        {/* Account Section */}
        <div className="py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">Account</h3>
          <div className="space-y-1">
            {/* 可编辑邮箱 */}
            {isEditingEmail ? (
              <div className="w-full p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm">Email</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveEmail}
                      disabled={isUpdating}
                      className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={16} className="animate-spin" /> : '保存'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="text-slate-400 hover:text-slate-300 disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <input
                  type="email"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
                  className="w-full bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="输入邮箱地址"
                  autoFocus
                />
              </div>
            ) : (
              <button 
                onClick={() => setIsEditingEmail(true)}
                className="w-full p-3 hover:bg-slate-700/50 rounded-lg text-left text-slate-300 flex justify-between items-center"
              >
                <span>Email</span>
                <div className="flex items-center">
                  <span className="text-slate-400 text-sm mr-2">
                    {currentUser?.email || 'a***@e***.com'}
                  </span>
                  <Edit3 size={16} className="text-slate-500" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Discovery Section */}
        <div className="py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">Discovery</h3>
          <div className="flex justify-between items-center p-3 hover:bg-slate-700/50 rounded-lg">
            <span className="text-slate-300">Show me on SoulMate</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="py-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase mb-2 px-1">Notifications</h3>
          <div className="space-y-1">
            <div className="flex justify-between items-center p-3 hover:bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Push Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <div className="flex justify-between items-center p-3 hover:bg-slate-700/50 rounded-lg">
              <span className="text-slate-300">Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="py-6 text-center space-y-4">
          <button
              onClick={handleLogout}
              className="w-full py-3 rounded-lg font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white border border-red-500"
            >
              Log Out
            </button>

        </div>

        <div className="pt-4 text-center">
          <p className="text-xs text-slate-600">Version 2.0.0 (Build 456)</p>
        </div>

        {/* Toast 通知 */}
        {toast && (
          <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white z-50 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
};

export default SettingsScreen;