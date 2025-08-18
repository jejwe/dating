'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowRight, MapPin, Crosshair } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import ScreenHeader from '@/components/Layout/ScreenHeader';
import Button from '@/components/Common/Button';
import Input from '@/components/Common/Input';
import { useAppContext } from '@/context/AppContext';

const ProfileSetupScreenPage: React.FC = () => {
  const router = useRouter();
  const { setCurrentUser } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', dateOfBirth: '', gender: '', location: '', bio: '',
    interests: [] as string[],
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // @ts-ignore
      setCurrentUser({
        id: 'current-user', name: formData.name, photos: uploadedPhotos,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        bio: formData.bio, interests: formData.interests, location: formData.location,
      });
      router.push('/discovery');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Simplified
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <div>Step 1 UI...</div>;
      case 2: return <div>Step 2 UI...</div>;
      case 3: return <div>Step 3 UI...</div>;
      default: return null;
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`Step ${currentStep}/3`} showBack onBack={() => currentStep > 1 && setCurrentStep(s => s - 1)} />
      <div className="flex-1 p-6">
        {renderStep()}
        <Button fullWidth onClick={handleNext} className="mt-8">
          {currentStep === 3 ? 'Finish' : 'Next'}
        </Button>
      </div>
    </ScreenContainer>
  );
};

export default ProfileSetupScreenPage;
