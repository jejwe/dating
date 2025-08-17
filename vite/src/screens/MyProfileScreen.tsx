import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, CreditCard, Settings, User, Calendar, Ruler, Globe, Camera, Edit3, X, Loader2 } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import BottomNav from '../components/Navigation/BottomNav';
import Avatar from '../components/Common/Avatar';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';

interface EditModalProps {
  isOpen: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
  type?: 'text' | 'date' | 'select' | 'textarea' | 'number';
  options?: string[];
  placeholder?: string;
}

const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  title, 
  value, 
  onClose, 
  onSave, 
  type = 'text',
  options = [],
  placeholder
}) => {
  const [editValue, setEditValue] = useState(value);

  /**
   * 监听value变化，确保每次打开modal时editValue都能正确初始化
   * 这解决了编辑框不自动填充当前值的问题
   */
  useEffect(() => {
    setEditValue(value);
  }, [value, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editValue);
    onClose();
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'textarea':
        return (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            rows={4}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 resize-none"
            placeholder={placeholder || `Enter ${title.toLowerCase()}`}
            maxLength={200}
          />
        );
      
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              value={editValue.replace(/[^\d]/g, '')} // 仅显示数字
              onChange={(e) => {
                // 输入阶段不拦截，仅保留数字，范围校验放到保存时
                const numValue = e.target.value.replace(/[^\d]/g, '');
                setEditValue(numValue);
              }}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
              placeholder="e.g. 180"
              min="100"
              max="250"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">cm</span>
          </div>
        );
      
      default:
        return (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
            placeholder={placeholder || `Enter ${title.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-sm border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-white">Edit {title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {renderInput()}
          {type === 'textarea' && (
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
              <span>Share something about yourself</span>
              <span>{editValue.length}/200</span>
            </div>
          )}
          {type === 'number' && (
            <p className="text-xs text-slate-500 mt-2">Height should be between 100-250 cm</p>
          )}
        </div>
        
        <div className="flex space-x-3 p-4 border-t border-slate-700">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// Normalize height from API data to a display-friendly string like "180cm"
const formatHeightForDisplay = (heightValue: unknown): string => {
  if (heightValue === null || heightValue === undefined) {
    return '';
  }
  if (typeof heightValue === 'number') {
    return `${heightValue}cm`;
  }
  const digitsOnly = String(heightValue).replace(/[^\d]/g, '');
  return digitsOnly ? `${digitsOnly}cm` : '';
};

const MyProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser, updateUserProfile } = useAppContext();
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state - initialize with empty values, will be loaded from API
  const [profileData, setProfileData] = useState({
    name: '',
    signature: '',
    username: '',
    gender: '',
    birthday: '',
    height: '',
    country: '',
    avatar: '',
    occupation: '',
    education: '',
    zodiac_sign: '',
    age: 0,
    location: '',
    id: ''
  });

  // Load user profile data from API - 优先使用 Context 中的用户数据
  useEffect(() => {
    const loadProfileData = async () => {
      // 如果 Context 中已有用户数据，直接使用，不发起请求
      if (currentUser) {
        console.log('🎯 Using existing user data from context');
        
        // Use birthday from API if available, otherwise calculate from age
        let birthday = currentUser.birthday; // 直接使用API返回的birthday字段
        if (!birthday && currentUser.age) {
          // 只有在birthday不存在时才从age估算
          const currentYear = new Date().getFullYear();
          const estimatedBirthYear = currentYear - currentUser.age;
          birthday = `${estimatedBirthYear}-01-01`;
        } else if (!birthday) {
          // 如果既没有birthday也没有age，使用默认值
          const currentYear = new Date().getFullYear();
          birthday = `${currentYear - 25}-01-01`;
        }
        
        // Map API data to profile data structure
        setProfileData({
          name: currentUser.name || '',
          signature: currentUser.bio || '',
          username: currentUser.name || currentUser.email?.split('@')[0] || '', // Use name or email prefix as username
          gender: currentUser.gender || '',
          birthday: birthday, // 使用实际的birthday字段或从age估算的值
          height: formatHeightForDisplay((currentUser as any).height),
          country: currentUser.location || 'United States', // Use location as country
          avatar: currentUser.photos?.[0] || '',
          occupation: currentUser.occupation || '',
          education: currentUser.education || '',
          zodiac_sign: currentUser.zodiac_sign || '',
          age: currentUser.age || 0,
          location: currentUser.location || '',
          id: currentUser.id || ''
        });
        
        setIsLoading(false);
        return;
      }

      // 只有在没有用户数据时才发起 API 请求
      console.log('🔄 No user data in context, fetching from API');
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiService.getCurrentUser();
        const user = response.user;
        
        // Use birthday from API if available, otherwise calculate from age
        let birthday = user.birthday; // 直接使用API返回的birthday字段
        if (!birthday && user.age) {
          // 只有在birthday不存在时才从age估算
          const currentYear = new Date().getFullYear();
          const estimatedBirthYear = currentYear - user.age;
          birthday = `${estimatedBirthYear}-01-01`;
        } else if (!birthday) {
          // 如果既没有birthday也没有age，使用默认值
          const currentYear = new Date().getFullYear();
          birthday = `${currentYear - 25}-01-01`;
        }
        
        // Map API data to profile data structure
        setProfileData({
          name: user.name || '',
          signature: user.bio || '',
          username: user.name || user.email?.split('@')[0] || '', // Use name or email prefix as username
          gender: user.gender || '',
          birthday: birthday, // 使用实际的birthday字段或从age估算的值
          height: formatHeightForDisplay((user as any).height),
          country: user.location || 'United States', // Use location as country
          avatar: user.photos?.[0] || '',
          occupation: user.occupation || '',
          education: user.education || '',
          zodiac_sign: user.zodiac_sign || '',
          age: user.age || 0,
          location: user.location || '',
          id: user.id || ''
        });
        
        // Update context with fresh user data
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [currentUser, setCurrentUser]); // 添加 currentUser 依赖

  // Modal states
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    field: string;
    title: string;
    value: string;
    type?: 'text' | 'date' | 'select' | 'textarea' | 'number';
    options?: string[];
    placeholder?: string;
  }>({
    isOpen: false,
    field: '',
    title: '',
    value: '',
    type: 'text'
  });

  const openEditModal = (
    field: string, 
    title: string, 
    value: string, 
    type: 'text' | 'date' | 'select' | 'textarea' | 'number' = 'text', 
    options?: string[],
    placeholder?: string
  ) => {
    setEditModal({
      isOpen: true,
      field,
      title,
      value,
      type,
      options,
      placeholder
    });
  };

  const handleSave = async (value: string) => {
    /**
     * 保存编辑结果到后端
     * - 对一般字段直接使用字符串值
     * - 对身高(height)字段：仅向后端传递纯数字（int），并在保存前做 100-250 的范围校验；本地显示仍为“xxxcm”
     */
    try {
      // 特殊处理 height：先校验并得到数值
      let sanitizedValue: string | number = value;
      if (editModal.field === 'height') {
        const numericHeight = parseInt(String(value).replace(/[^\d]/g, ''), 10);
        if (Number.isNaN(numericHeight)) {
          setToast({ message: 'Please enter a valid height', type: 'error' });
          setTimeout(() => setToast(null), 2200);
          return;
        }
        if (numericHeight < 100 || numericHeight > 250) {
          setToast({ message: 'Height must be between 100-250 cm', type: 'error' });
          setTimeout(() => setToast(null), 2200);
          return;
        }
        sanitizedValue = numericHeight;
      }

      // Update local state immediately for better UX
      setProfileData(prev => ({
        ...prev,
        [editModal.field]: editModal.field === 'height' ? formatHeightForDisplay(sanitizedValue) : value
      }));
      
      // Prepare update data for API
      const updateData: any = {};
      
      // Map field names to API field names
      switch (editModal.field) {
        case 'signature':
          updateData.bio = value;
          break;
        case 'name':
          updateData.name = value;
          break;
        case 'username':
          // Map Username to backend name field
          updateData.name = value;
          break;
        case 'gender':
        case 'location':
        case 'occupation':
        case 'education':
        case 'zodiac_sign':
        case 'birthday': // 添加birthday字段支持API更新
          updateData[editModal.field] = value;
          break;
        case 'country':
          updateData.location = value; // Map country to location
          break;
        case 'height': {
          // 仅传递整数，不包含单位
          updateData.height = sanitizedValue; // int 类型
          break;
        }
        default:
          updateData[editModal.field] = value;
      }
      
      // Send update to API if there's data to update
      if (Object.keys(updateData).length > 0) {
        // 携带当前用户ID（后端用token识别用户，但附带ID便于某些部署/日志）
        await updateUserProfile({ ...updateData, userId: currentUser?.id } as any);
        setToast({ message: 'Saved successfully', type: 'success' });
        setTimeout(() => setToast(null), 2200);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Revert local changes on error
      if (currentUser) {
        setProfileData(prev => ({
          ...prev,
          name: currentUser.name || '',
          signature: currentUser.bio || '',
          location: currentUser.location || '',
          occupation: currentUser.occupation || '',
          education: currentUser.education || '',
          gender: currentUser.gender || '',
          zodiac_sign: currentUser.zodiac_sign || ''
        }));
      }
      // Show non-blocking toast instead of full-page error
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setToast({ message, type: 'error' });
      setTimeout(() => setToast(null), 2600);
    }
  };

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image size must be less than 5MB', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select a valid image file', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const base64WithoutPrefix = base64Data.split(',')[1]; // Remove data:image/...;base64, prefix
          
          // Upload to backend
          const uploadResponse = await apiService.uploadPhoto(
            base64WithoutPrefix,
            file.type,
            file.name
          );
          
          if (uploadResponse.success && uploadResponse.photoUrl) {
            // Update profile data locally
            setProfileData(prev => ({ ...prev, avatar: uploadResponse.photoUrl }));
            
            // Update user profile with new avatar
            await updateUserProfile({ 
              photos: [uploadResponse.photoUrl, ...(currentUser?.photos?.slice(1) || [])]
            });
            
            setToast({ message: 'Avatar updated successfully!', type: 'success' });
            setTimeout(() => setToast(null), 2000);
          } else {
            const errorMsg = uploadResponse.error || uploadResponse.message || 'Upload failed';
            throw new Error(errorMsg);
          }
        } catch (error) {
          console.error('Avatar upload failed:', error);
          setToast({ 
            message: error instanceof Error ? error.message : 'Failed to upload avatar', 
            type: 'error' 
          });
          setTimeout(() => setToast(null), 3000);
        } finally {
          setIsUploading(false);
        }
      };
      
      reader.onerror = () => {
        setToast({ message: 'Failed to read image file', type: 'error' });
        setTimeout(() => setToast(null), 3000);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Avatar upload error:', error);
      setToast({ message: 'Failed to upload avatar', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      setIsUploading(false);
    }
    
    // Reset file input value to allow selecting the same file again
    event.target.value = '';
  };

  // Loading state
  if (isLoading) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading profile...</p>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ScreenContainer>
    );
  }

  if (!currentUser && !profileData.id) {
    return (
      <ScreenContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400">Please log in to view your profile</p>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Compact Header */}
      <div className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 p-3 flex items-center justify-center">
        <h1 className="text-base font-semibold text-slate-100">My Profile</h1>
      </div>

      <div className="flex-1 p-4 pb-28 overflow-y-auto">
        {/* Profile Avatar & Basic Info */}
        <div className="flex items-center mb-6">
          <div className="relative mr-4">
            <Avatar
              src={profileData.avatar}
              name={profileData.name}
              size="lg"
            />
            <button
              onClick={handleAvatarUpload}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            >
              {isUploading ? (
                <Loader2 size={10} className="animate-spin" />
              ) : (
                <Camera size={12} />
              )}
            </button>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {profileData.name} {profileData.id && `(ID: ${String(profileData.id).slice(-5)})`}
            </h2>
            <button
              onClick={() => openEditModal(
                'signature', 
                'Signature', 
                profileData.signature, 
                'textarea',
                undefined,
                'Tell others about yourself...'
              )}
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors text-left block"
            >
              <span className="block">{profileData.signature}</span>
              <Edit3 size={12} className="inline ml-1 text-slate-500 mt-1" />
            </button>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">👑</span>
                <span className="text-white font-semibold">50</span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-500 mr-1">💎</span>
                <span className="text-white font-semibold">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/subscription')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="mr-2">⭐</span>
            Upgrade to Premium
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <button 
            onClick={() => navigate('/my-likes')}
            className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Heart size={24} className="text-slate-400 mb-2" />
            <span className="text-xs text-slate-300">My Likes</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <Eye size={24} className="text-slate-400 mb-2" />
            <span className="text-xs text-slate-300">Visitors</span>
          </button>
          <button className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
            <CreditCard size={24} className="text-slate-400 mb-2" />
            <span className="text-xs text-slate-300">My Wallet</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Settings size={24} className="text-slate-400 mb-2" />
            <span className="text-xs text-slate-300">Settings</span>
          </button>
        </div>

        {/* Profile Details */}
        <div className="space-y-1">
          <button
            onClick={() => openEditModal('username', 'Username', profileData.username)}
            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center">
              <User size={20} className="text-slate-400 mr-3" />
              <span className="text-slate-300">Username</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">{profileData.username}</span>
              <span className="text-slate-500">›</span>
            </div>
          </button>

          <button
            onClick={() => openEditModal('gender', 'Gender', profileData.gender, 'select', ['Male', 'Female', 'Other'])}
            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                <span className="text-slate-400">♂</span>
              </div>
              <span className="text-slate-300">Gender</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">{profileData.gender}</span>
              <span className="text-slate-500">›</span>
            </div>
          </button>

          <button
            onClick={() => openEditModal('birthday', 'Birthday', profileData.birthday, 'date')}
            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center">
              <Calendar size={20} className="text-slate-400 mr-3" />
              <span className="text-slate-300">Birthday</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">{profileData.birthday}</span>
              <span className="text-slate-500">›</span>
            </div>
          </button>

          <button
            onClick={() => openEditModal('height', 'Height', profileData.height, 'number')}
            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center">
              <Ruler size={20} className="text-slate-400 mr-3" />
              <span className="text-slate-300">Height</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">{profileData.height}</span>
              <span className="text-slate-500">›</span>
            </div>
          </button>

          <button
            onClick={() => openEditModal('country', 'Country', profileData.country, 'select', ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Japan', 'China', 'Other'])}
            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center">
              <Globe size={20} className="text-slate-400 mr-3" />
              <span className="text-slate-300">Country</span>
            </div>
            <div className="flex items-center">
              <span className="text-slate-400 mr-2">{profileData.country}</span>
              <span className="text-slate-500">›</span>
            </div>
          </button>

          {/* Additional profile fields from API */}
          {profileData.occupation && (
            <button
              onClick={() => openEditModal('occupation', 'Occupation', profileData.occupation)}
              className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <span className="text-slate-400">💼</span>
                </div>
                <span className="text-slate-300">Occupation</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 mr-2">{profileData.occupation}</span>
                <span className="text-slate-500">›</span>
              </div>
            </button>
          )}

          {profileData.education && (
            <button
              onClick={() => openEditModal('education', 'Education', profileData.education)}
              className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <span className="text-slate-400">🎓</span>
                </div>
                <span className="text-slate-300">Education</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 mr-2">{profileData.education}</span>
                <span className="text-slate-500">›</span>
              </div>
            </button>
          )}

          {profileData.zodiac_sign && (
            <button
              onClick={() => openEditModal('zodiac_sign', 'Zodiac Sign', profileData.zodiac_sign, 'select', ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'])}
              className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 mr-3 flex items-center justify-center">
                  <span className="text-slate-400">⭐</span>
                </div>
                <span className="text-slate-300">Zodiac Sign</span>
              </div>
              <div className="flex items-center">
                <span className="text-slate-400 mr-2">{profileData.zodiac_sign}</span>
                <span className="text-slate-500">›</span>
              </div>
            </button>
          )}
        </div>


      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        title={editModal.title}
        value={editModal.value}
        type={editModal.type}
        options={editModal.options}
        placeholder={editModal.placeholder}
        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        onSave={handleSave}
      />

      {/* Bottom toast */}
      {toast && (
        <div className={`fixed left-1/2 -translate-x-1/2 bottom-24 z-50 px-4 py-2 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      <BottomNav />
    </ScreenContainer>
  );
};

export default MyProfileScreen;
