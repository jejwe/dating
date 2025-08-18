import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

/**
 * Avatar组件 - 显示用户头像，支持图片加载失败时显示首字母备用方案
 * @param src 头像图片URL
 * @param name 用户名称
 * @param size 头像尺寸
 * @param className 额外的CSS类名
 * @param showOnlineStatus 是否显示在线状态
 * @param isOnline 是否在线
 */
const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  showOnlineStatus = false,
  isOnline = false
}) => {
  // 状态管理：图片是否加载失败
  const [imageError, setImageError] = useState(false);
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const onlineStatusSizes = {
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-3 h-3 -bottom-0.5 -right-0.5',
    lg: 'w-4 h-4 -bottom-1 -right-1',
    xl: 'w-6 h-6 -bottom-1 -right-1'
  };

  // Generate color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-pink-500 to-rose-500',
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
      'from-teal-500 to-green-500'
    ];

    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const firstLetter = name.charAt(0).toUpperCase();
  const gradientColor = getAvatarColor(name);

  /**
   * 处理图片加载失败事件
   */
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={`relative ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={handleImageError}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center font-bold text-white shadow-lg`}
        >
          {firstLetter}
        </div>
      )}

      {showOnlineStatus && (
        <div
          className={`absolute ${onlineStatusSizes[size]} ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          } rounded-full border-2 border-slate-900`}
        />
      )}
    </div>
  );
};

export default Avatar;
