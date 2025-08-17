import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Crosshair } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import ScreenHeader from '../components/Layout/ScreenHeader';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { apiService } from '../services/api';

interface SignupFormData {
  // Step 1: Account Creation
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal Info
  name: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  
  // Step 3: Profile Details
  bio: string;
  occupation: string;
  education: string;
  zodiacSign: string;
  
  // Step 4: Photos
  photos: string[];
  
  // Step 5: Interests
  interests: string[];
  
  // Step 6: Preferences
  interestedIn: string;
  ageRange: [number, number];
}

const AVAILABLE_INTERESTS = [
  'Travel', 'Photography', 'Movies', 'Cooking', 'Reading', 
  'Gaming', 'Music', 'Hiking', 'Art', 'Dancing', 'Fitness', 
  'Coffee', 'Sports', 'Nature', 'Technology', 'Fashion', 
  'Food', 'Animals', 'Adventure', 'Culture'
];

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    bio: '',
    occupation: '',
    education: '',
    zodiacSign: '',
    photos: [],
    interests: [],
    interestedIn: 'everyone',
    ageRange: [18, 35]
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
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateStep1 = () => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    
    // Validate date format and year
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.dateOfBirth)) {
      setError('Please enter a valid date');
      return false;
    }
    
    const year = parseInt(formData.dateOfBirth.split('-')[0]);
    const currentYear = new Date().getFullYear();
    
    if (year < 1900 || year > currentYear) {
      setError(`Please enter a valid year between 1900 and ${currentYear}`);
      return false;
    }
    
    const age = calculateAge(formData.dateOfBirth);
    if (age < 18) {
      setError('You must be at least 18 years old');
      return false;
    }
    if (age > 100) {
      setError('Please enter a valid birth date');
      return false;
    }
    if (!formData.gender) {
      setError('Please select your gender');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (formData.photos.length < 2) {
      setError('Please add at least 2 photos to continue');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    
    // Step 1 validation
    if (currentStep === 1) {
      if (!validateStep1()) {
        return; // Stop here if validation fails
      }
      setCurrentStep(2);
      return;
    }
    
    // Step 2 validation
    if (currentStep === 2) {
      if (!validateStep2()) {
        return; // Stop here if validation fails
      }
      setCurrentStep(3);
      return;
    }
    
    // Step 4 validation (photos)
    if (currentStep === 4) {
      if (!validateStep4()) {
        return; // Stop here if validation fails
      }
      setCurrentStep(5);
      return;
    }
    
    // Steps 3, 5 don't require validation, just move to next step
    if (currentStep === 3 || currentStep === 5) {
      setCurrentStep(currentStep + 1);
      return;
    }
  };

  const handleBack = () => {
    setError('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    try {
      const age = calculateAge(formData.dateOfBirth);
      
      // 确保所有必要的数据都包含在注册请求中
      const response = await apiService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        age: age,
        gender: formData.gender,
        bio: formData.bio.trim() || '',
        location: formData.location.trim() || '',
        interests: formData.interests,
        // 添加额外的个人资料信息
        occupation: formData.occupation.trim() || '',
        education: formData.education.trim() || '',
        zodiac_sign: formData.zodiacSign || '',
        photos: formData.photos, // 确保照片数据被传递
        // 添加偏好设置
        interested_in: formData.interestedIn,
        age_min: formData.ageRange[0],
        age_max: formData.ageRange[1],
        date_of_birth: formData.dateOfBirth // 传递完整的出生日期
      });
      
      console.log('Registration successful:', response);
      
      // 注册成功后直接导航到发现页面
      navigate('/discover');
      
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === 'object' && err !== null) {
        // 尝试提取更详细的错误信息
        const errorObj = err as any;
        if (errorObj.details) {
          setError(`注册失败: ${JSON.stringify(errorObj.details)}`);
        } else if (errorObj.error) {
          setError(errorObj.error);
        } else {
          setError('注册失败，请重试');
        }
      } else {
        setError('注册失败，请重试');
      }
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

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-slate-400">Let's start with your basic information</p>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => updateFormData('email', e.target.value)}
        required
      />
      
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={(e) => updateFormData('password', e.target.value)}
        required
      />
      
      <Input
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
        required
      />

      <Button onClick={handleNext} fullWidth>
        Next
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Personal Information</h2>
        <p className="text-slate-400">Tell us about yourself</p>
      </div>

      <Input
        label="Full Name"
        type="text"
        placeholder="Your full name"
        value={formData.name}
        onChange={(e) => updateFormData('name', e.target.value)}
        required
      />
      
      <Input
        label="Date of Birth"
        type="date"
        value={formData.dateOfBirth}
        onChange={(e) => {
          const value = e.target.value;
          
          // If the value contains a year, validate it
          if (value.length >= 4) {
            const year = parseInt(value.substring(0, 4));
            const currentYear = new Date().getFullYear();
            
            // Prevent years outside reasonable range
            if (year < 1900 || year > currentYear) {
              return; // Don't update if year is invalid
            }
          }
          
          updateFormData('dateOfBirth', value);
        }}
        max={new Date().toISOString().split('T')[0]}
        min="1900-01-01"
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
        <select
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={formData.gender}
          onChange={(e) => updateFormData('gender', e.target.value)}
          required
        >
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
        <div className="relative">
          <Input
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => updateFormData('location', e.target.value)}
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        </div>
        <button 
          type="button"
          className="mt-2 text-sm text-indigo-400 hover:underline flex items-center"
        >
          <Crosshair size={12} className="mr-1" />
          Use current location
        </button>
      </div>

      <div className="flex space-x-3">
        <Button onClick={handleBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button onClick={handleNext} fullWidth>
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Profile Details</h2>
        <p className="text-slate-400">Help others get to know you better</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Bio (Optional)
        </label>
        <textarea
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={4}
          placeholder="Tell us something interesting about yourself..."
          value={formData.bio}
          onChange={(e) => updateFormData('bio', e.target.value)}
          maxLength={500}
        />
        <div className="text-right text-xs text-slate-500 mt-1">
          {formData.bio.length}/500
        </div>
      </div>
      
      <Input
        label="Occupation (Optional)"
        type="text"
        placeholder="Your job or profession"
        value={formData.occupation}
        onChange={(e) => updateFormData('occupation', e.target.value)}
      />
      
      <Input
        label="Education (Optional)"
        type="text"
        placeholder="Your education background"
        value={formData.education}
        onChange={(e) => updateFormData('education', e.target.value)}
      />
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Zodiac Sign (Optional)</label>
        <select
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={formData.zodiacSign}
          onChange={(e) => updateFormData('zodiacSign', e.target.value)}
        >
          <option value="">Select Zodiac Sign</option>
          {ZODIAC_SIGNS.map((sign) => (
            <option key={sign} value={sign}>{sign}</option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3">
        <Button onClick={handleBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button onClick={handleNext} fullWidth>
          Next
        </Button>
      </div>
    </div>
  );

  const handlePhotoUpload = (index: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // 检查文件大小
        if (file.size > 5 * 1024 * 1024) { // 5MB限制
          setError('图片大小不能超过5MB');
          return;
        }
        
        // 创建图片预览URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          
          // 检查base64字符串长度
          if (imageUrl.length > 1024 * 1024) { // 约1MB的base64数据
            // 压缩图片
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // 计算缩放比例，保持宽高比
              const maxDimension = 1200;
              if (width > height && width > maxDimension) {
                height = (height * maxDimension) / width;
                width = maxDimension;
              } else if (height > maxDimension) {
                width = (width * maxDimension) / height;
                height = maxDimension;
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              
              // 以较低质量导出
              const compressedImageUrl = canvas.toDataURL('image/jpeg', 0.7);
              
              const newPhotos = [...formData.photos];
              newPhotos[index] = compressedImageUrl;
              updateFormData('photos', newPhotos);
            };
            img.src = imageUrl;
          } else {
            // 直接使用原始图片
            const newPhotos = [...formData.photos];
            newPhotos[index] = imageUrl;
            updateFormData('photos', newPhotos);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...formData.photos];
    newPhotos.splice(index, 1);
    updateFormData('photos', newPhotos);
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Add Photos</h2>
        <p className="text-slate-400">Add at least 2 photos to continue</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 cursor-pointer transition-colors relative overflow-hidden"
            onClick={() => handlePhotoUpload(i)}
          >
            {formData.photos[i] ? (
              <>
                <img
                  src={formData.photos[i]}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(i);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
                {i === 0 && (
                  <div className="absolute bottom-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </div>
                )}
              </>
            ) : (
              <>
                <Camera size={24} className={i === 0 ? 'text-indigo-400' : ''} />
                {i === 0 && <span className="text-xs text-indigo-400 mt-1">Main</span>}
              </>
            )}
          </div>
        ))}
      </div>

      <ul className="text-xs text-slate-500 space-y-1">
        <li>• Show your face clearly</li>
        <li>• No filters that significantly alter appearance</li>
        <li>• Be yourself!</li>
      </ul>

      <div className="flex space-x-3">
        <Button onClick={handleBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          fullWidth
          disabled={formData.photos.length < 2}
        >
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">What Are You Into?</h2>
        <p className="text-slate-400">Select your interests to find better matches</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {AVAILABLE_INTERESTS.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              formData.interests.includes(interest)
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="text-center text-sm text-slate-500">
        Selected: {formData.interests.length} interests
      </div>

      <div className="flex space-x-3">
        <Button onClick={handleBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button onClick={handleNext} fullWidth>
          Next
        </Button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Dating Preferences</h2>
        <p className="text-slate-400">Set your matching preferences</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">I'm interested in</label>
        <select
          className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          value={formData.interestedIn}
          onChange={(e) => updateFormData('interestedIn', e.target.value)}
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="everyone">Everyone</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Age Range</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="18"
            max="100"
            value={formData.ageRange[0]}
            onChange={(e) => updateFormData('ageRange', [parseInt(e.target.value) || 18, formData.ageRange[1]])}
            className="w-1/2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <span className="text-slate-500">-</span>
          <input
            type="number"
            min="18"
            max="100"
            value={formData.ageRange[1]}
            onChange={(e) => updateFormData('ageRange', [formData.ageRange[0], parseInt(e.target.value) || 35])}
            className="w-1/2 p-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <Button onClick={handleBack} variant="secondary" fullWidth>
          Back
        </Button>
        <Button onClick={handleSubmit} fullWidth disabled={loading}>
          {loading ? 'Creating Account...' : 'Complete Signup'}
        </Button>
      </div>
    </div>
  );

  const renderSocialSignup = () => (
    <div className="mt-8">
      <div className="relative flex py-3 items-center">
        <div className="flex-grow border-t border-slate-700"></div>
        <span className="flex-shrink mx-4 text-slate-500 text-sm">Or sign up with</span>
        <div className="flex-grow border-t border-slate-700"></div>
      </div>
      
      <div className="flex space-x-3 mt-4">
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
    </div>
  );

  return (
    <ScreenContainer>
      <ScreenHeader 
        title={`Step ${currentStep} of 6`} 
        showBack={currentStep > 1 ? handleBack : () => navigate('/login')}
      />
      
      <div className="flex-1 p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div
                key={step}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step <= currentStep
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}

        {/* Social Signup - Only show on first step */}
        {currentStep === 1 && renderSocialSignup()}

        {/* Login Link */}
        <p className="text-xs text-slate-500 text-center mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-indigo-400 hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </ScreenContainer>
  );
};

export default SignupScreen;