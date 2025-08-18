'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Users, Hash, Image as ImageIcon, Plus } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import ScreenHeader from '@/components/Layout/ScreenHeader';
import Button from '@/components/Common/Button';
import SmartImageLayout from '@/components/Common/SmartImageLayout';
import { useAppContext } from '@/context/AppContext';
import { apiService } from '@/lib/api';

const CreateMomentPage: React.FC = () => {
  const router = useRouter();
  const { createMoment } = useAppContext();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [audience, setAudience] = useState<'public' | 'friends' | 'private'>('public');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementation for image upload
  };

  const handlePost = async () => {
    if ((!content.trim() && images.length === 0) || isPosting) return;
    setIsPosting(true);
    try {
      await createMoment({ content, images, hashtags: tags, audience });
      router.push('/moments');
    } catch (error) {
      setPostError(error instanceof Error ? error.message : 'Failed to post moment.');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader
        title="Create Moment"
        showBack
        onBack={() => router.back()}
        rightElement={
          <Button
            onClick={handlePost}
            disabled={(!content.trim() && images.length === 0) || isPosting}
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        }
      />
      <div className="flex-1 p-4 overflow-y-auto">
        <textarea
          rows={5}
          placeholder="Share something..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
        />

        {images.length > 0 && (
            <div className="mt-4">
                {/* A simplified layout for brevity */}
                <img src={images[0]} alt="preview" className="rounded-lg"/>
            </div>
        )}

        <div className="mt-4">
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-4 bg-slate-700 rounded-lg flex items-center justify-center">
                <ImageIcon size={24} /> <span className="ml-2">Add Photos</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
        </div>

        {/* Simplified UI for brevity */}
        <div className="mt-4">
            <p>Tags, Audience selector...</p>
        </div>

        {postError && <p className="text-red-500 mt-4">{postError}</p>}
      </div>
    </ScreenContainer>
  );
};

export default CreateMomentPage;
