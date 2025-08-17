import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface ImageWithPlaceholderProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * 带占位图片的图片组件
 * 当图片加载失败时，显示占位图片
 */
const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt = '',
  className = '',
  style,
  onClick
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * 处理图片加载错误
   */
  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  /**
   * 处理图片加载成功
   */
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // 如果图片加载失败，显示占位图片
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{
          ...style,
          minHeight: style?.height || '100px',
          minWidth: style?.width || '100px'
        }}
        onClick={onClick}
      >
        <ImageIcon 
          className="text-gray-400" 
          size={Math.min(
            parseInt(String(style?.width || 40)) / 3,
            parseInt(String(style?.height || 40)) / 3,
            40
          )}
        />
      </div>
    );
  }

  return (
    <div className="relative" style={style}>
      {/* 加载中的占位符 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse rounded">
          <div className="flex flex-col items-center justify-center space-y-2">
            <ImageIcon className="text-gray-400" size={24} />
            <div className="w-8 h-1 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      )}
      
      {/* 实际图片 */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 w-full h-full object-cover`}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
      />
    </div>
   );
 };

export default ImageWithPlaceholder;