'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Crosshair } from 'lucide-react';
import ScreenContainer from '@/components/Layout/ScreenContainer';
import ScreenHeader from '@/components/Layout/ScreenHeader';
import Button from '@/components/Common/Button';
import Input from '@/components/Common/Input';
import { apiService } from '@/lib/api';

interface SignupFormData {
  email: string; password: string; confirmPassword: string;
  name: string; dateOfBirth: string; gender: string; location: string;
  bio: string; occupation: string; education: string; zodiacSign: string;
  photos: string[];
  interests: string[];
  interestedIn: string; ageRange: [number, number];
}

const AVAILABLE_INTERESTS = [
  'Travel', 'Photography', 'Movies', 'Cooking', 'Reading', 'Gaming', 'Music', 'Hiking', 'Art', 'Dancing', 'Fitness',
  'Coffee', 'Sports', 'Nature', 'Technology', 'Fashion', 'Food', 'Animals', 'Adventure', 'Culture'
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SignupScreen: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<SignupFormData>({
    email: '', password: '', confirmPassword: '', name: '', dateOfBirth: '', gender: '', location: '',
    bio: '', occupation: '', education: '', zodiacSign: '', photos: [], interests: [],
    interestedIn: 'everyone', ageRange: [18, 35]
  });

  const updateFormData = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 18;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const validateStep = () => {
    if (currentStep === 1) {
        if (!formData.email.includes('@')) { setError('Please enter a valid email.'); return false; }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); return false; }
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return false; }
    }
    if (currentStep === 2) {
        if (formData.name.trim().length < 2) { setError('Name must be at least 2 characters.'); return false; }
        if (!formData.dateOfBirth) { setError('Date of birth is required.'); return false; }
        if (calculateAge(formData.dateOfBirth) < 18) { setError('You must be at least 18 years old.'); return false; }
        if (!formData.gender) { setError('Please select your gender.'); return false; }
    }
    if (currentStep === 4) {
        if (formData.photos.length < 2) { setError('Please add at least 2 photos.'); return false; }
    }
    return true;
  }

  const handleNext = () => {
    setError('');
    if (validateStep()) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      router.push('/login');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    setError('');
    try {
      await apiService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: calculateAge(formData.dateOfBirth),
        gender: formData.gender,
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        interests: formData.interests,
        occupation: formData.occupation.trim(),
        education: formData.education.trim(),
        zodiac_sign: formData.zodiacSign,
        photos: formData.photos,
        interested_in: formData.interestedIn,
        age_min: formData.ageRange[0],
        age_max: formData.ageRange[1],
        date_of_birth: formData.dateOfBirth
      });
      router.push('/discover');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    const currentInterests = formData.interests;
    if (currentInterests.includes(interest)) {
      updateFormData('interests', currentInterests.filter(i => i !== interest));
    } else if (currentInterests.length < 10) {
      updateFormData('interests', [...currentInterests, interest]);
    }
  };

  const handlePhotoUpload = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhotos = [...formData.photos];
        newPhotos[index] = event.target?.result as string;
        updateFormData('photos', newPhotos);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    updateFormData('photos', newPhotos);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return (
        <>
          <Input label="Email Address" type="email" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} required />
          <Input label="Password" type="password" value={formData.password} onChange={(e) => updateFormData('password', e.target.value)} required />
          <Input label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => updateFormData('confirmPassword', e.target.value)} required />
        </>
      );
      case 2: return (
          <>
            <Input label="Full Name" type="text" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} required />
            <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => updateFormData('dateOfBirth', e.target.value)} required />
            <select value={formData.gender} onChange={(e) => updateFormData('gender', e.target.value)} required className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg">
                <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
            </select>
            <Input label="Location" type="text" value={formData.location} onChange={(e) => updateFormData('location', e.target.value)} />
          </>
      );
      case 3: return (
          <>
            <textarea placeholder="Bio" value={formData.bio} onChange={(e) => updateFormData('bio', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg" />
            <Input label="Occupation" type="text" value={formData.occupation} onChange={(e) => updateFormData('occupation', e.target.value)} />
            <Input label="Education" type="text" value={formData.education} onChange={(e) => updateFormData('education', e.target.value)} />
          </>
      );
      case 4: return (
        <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center" onClick={() => handlePhotoUpload(i)}>
                {formData.photos[i] ? <img src={formData.photos[i]} alt="" className="w-full h-full object-cover" /> : <Camera size={24} />}
            </div>
            ))}
        </div>
      );
      case 5: return (
        <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map(interest => (
            <button key={interest} onClick={() => toggleInterest(interest)} className={`px-3 py-1.5 rounded-full text-sm border ${formData.interests.includes(interest) ? 'bg-indigo-600 text-white' : 'bg-slate-700'}`}>
                {interest}
            </button>
            ))}
        </div>
      );
      case 6: return (
          <>
            <select value={formData.interestedIn} onChange={(e) => updateFormData('interestedIn', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg">
                <option value="women">Women</option><option value="men">Men</option><option value="everyone">Everyone</option>
            </select>
            <Input label="Age Range" type="text" value={formData.ageRange.join('-')} onChange={(e) => updateFormData('ageRange', e.target.value.split('-').map(Number) as [number, number])} />
          </>
      );
      default: return null;
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title={`Step ${currentStep} of 6`} showBack onBack={handleBack} />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="w-full bg-slate-700 rounded-full h-2 mb-8">
          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(currentStep / 6) * 100}%` }} />
        </div>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <div className="space-y-6">{renderStepContent()}</div>
        <div className="flex space-x-3 mt-6">
          {currentStep > 1 && <Button onClick={handleBack} variant="secondary" fullWidth>Back</Button>}
          {currentStep < 6 && <Button onClick={handleNext} fullWidth>Next</Button>}
          {currentStep === 6 && <Button onClick={handleSubmit} fullWidth disabled={loading}>{loading ? 'Creating Account...' : 'Complete Signup'}</Button>}
        </div>
      </div>
    </ScreenContainer>
  );
};

export default SignupScreen;
