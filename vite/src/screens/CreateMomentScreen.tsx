import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Users, Hash, Image as ImageIcon, Plus } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import ScreenHeader from '../components/Layout/ScreenHeader';
import Button from '../components/Common/Button';
import SmartImageLayout from '../components/Common/SmartImageLayout';
import { useAppContext } from '../context/AppContext';
import { apiService } from '../services/api';

const CreateMomentScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createMoment } = useAppContext();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [audience, setAudience] = useState<'everyone' | 'matches' | 'favorites'>('everyone');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (postError) {
      setPostError(null);
    }
    setContent(e.target.value);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (postError) {
      setPostError(null);
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (images.length + uploadedUrls.length >= 9) break;
      try {
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });

        // 使用专门的moments图片上传接口
        const response = await apiService.uploadMomentImage(base64String, file.type, file.name);
        if (response.success && response.photoUrl) {
          uploadedUrls.push(response.photoUrl);
        } else {
          throw new Error(response.error || 'Upload failed');
        }
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        alert(`Failed to upload ${file.name}.`);
      }
    }

    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
    }
    setIsUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 5) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  };

  const handlePost = async () => {
    if ((!content.trim() && images.length === 0) || isPosting) {
      return;
    }

    setIsPosting(true);
    setPostError(null);

    const audienceMapping = {
      everyone: 'public',
      matches: 'friends', 
      favorites: 'private'
    };

    const momentData = {
      content: content.trim(),
      images: images,
      hashtags: tags,
      audience: audienceMapping[audience] as 'public' | 'friends' | 'private',
    };

    try {
      await createMoment(momentData);
      navigate('/moments');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Failed to post moment:', error);
      setPostError(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Create Moment"
        showBack
        rightElement={
          <Button
            variant="ghost"
            size="sm"
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
            onClick={handlePost}
            disabled={(!content.trim() && images.length === 0) || isPosting || isUploading}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        }
      />

      <div className="flex-1 p-4">
        {/* Text Input */}
        <textarea
          rows={6}
          placeholder="Share what's new..."
          value={content}
          onChange={handleContentChange}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400 resize-none"
          maxLength={500}
        />

        {/* Post Error Message */}
        {postError && (
          <div className="mt-2 text-sm text-red-400">
            {postError}
          </div>
        )}

        {/* Images Preview */}
        {images.length > 0 && (
          <div className="mt-4">
            <SmartImageLayout
              images={images}
              onImageClick={(index) => {
                console.log('Image clicked:', index);
              }}
              onRemoveImage={removeImage}
              editable={true}
              className="max-h-64"
            />
          </div>
        )}

        {/* Photo Upload Section */}
        {images.length < 9 && (
          <div className="mt-4">
            <button
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-sm mt-2">Uploading...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={24} />
                  <span className="text-sm mt-1">
                    {images.length === 0 ? 'Add Photos' : `Add More (${9 - images.length} remaining)`}
                  </span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        )}

        {/* Additional Options */}
        <div className="mt-4 space-y-3">
          {/* Tags */}
          <div className="p-3 bg-slate-700 rounded-lg">
            <div className="flex items-center mb-2">
              <Hash size={18} className="text-slate-400 mr-3" />
              <input
                type="text"
                placeholder="Add tags (max 5)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-transparent text-white placeholder-slate-400 outline-none text-sm"
              />
              <button onClick={handleAddTag} className="ml-2 p-1 text-indigo-400 hover:text-indigo-300 disabled:text-slate-500" disabled={!currentTag.trim()}>
                <Plus size={18} />
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-full flex items-center"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-white/80 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="flex items-center p-3 bg-slate-700 rounded-lg">
            <Users size={18} className="text-slate-400 mr-3" />
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as any)}
              className="flex-1 bg-transparent text-white outline-none text-sm"
            >
              <option value="everyone" className="bg-slate-700">Everyone</option>
              <option value="matches" className="bg-slate-700">Matches only</option>
              <option value="favorites" className="bg-slate-700">Favorites only</option>
            </select>
          </div>
        </div>

        {/* Character Count */}
        <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
          <span>{images.length}/9 photos</span>
          <span>{content.length}/500 characters</span>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default CreateMomentScreen;