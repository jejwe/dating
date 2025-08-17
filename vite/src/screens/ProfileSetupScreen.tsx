import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowRight, MapPin, Crosshair } from 'lucide-react';
import ScreenContainer from '../components/Layout/ScreenContainer';
import ScreenHeader from '../components/Layout/ScreenHeader';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { useAppContext } from '../context/AppContext';

const ProfileSetupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    location: '',
    bio: '',
    interests: [] as string[],
    interestedIn: '',
    ageRange: [18, 35],
    maxDistance: 50
  });

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const availableInterests = [
    'Travel', 'Photography', 'Movies', 'Cooking', 'Reading', 
    'Gaming', 'Music', 'Hiking', 'Art', 'Dancing', 'Fitness', 'Coffee'
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && uploadedPhotos.length < 6) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedPhotos(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handlePhotoClick = (index: number) => {
    if (uploadedPhotos[index]) {
      // Remove photo if clicked
      setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      // Trigger file input for empty slot
      fileInputRef.current?.click();
    }
  };

  const handleInterestToggle = (interest: string) => {
    if (formData.interests.includes(interest)) {
      setFormData({
        ...formData,
        interests: formData.interests.filter(i => i !== interest)
      });
    } else if (formData.interests.length < 5) {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest]
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete setup
      setCurrentUser({
        id: 'current-user',
        name: formData.name,
        age: new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear(),
        photos: uploadedPhotos.length > 0 ? uploadedPhotos : ['https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=300'],
        bio: formData.bio,
        interests: formData.interests,
        location: formData.location
      });
      navigate('/discovery');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Input
              label="First Name"
              placeholder="Enter your first name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            
            <Input
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => {
                const value = e.target.value;
                // Validate year if present
                if (value.length >= 4) {
                  const year = parseInt(value.substring(0, 4));
                  const currentYear = new Date().getFullYear();
                  if (year < 1900 || year > currentYear) {
                    return; // Don't update if year is invalid
                  }
                }
                setFormData({ ...formData, dateOfBirth: value });
              }}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Gender</label>
              <select
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <div className="relative">
                <Input
                  placeholder="E.g., New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="pr-10"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
              <button className="mt-2 text-sm text-indigo-400 hover:underline flex items-center">
                <Crosshair size={12} className="mr-1" />
                Use current location
              </button>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <p className="text-sm text-slate-400">Add at least 2 photos to continue. Click to upload/remove photos.</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  onClick={() => handlePhotoClick(i)}
                  className="aspect-[3/4] bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 cursor-pointer transition-colors relative overflow-hidden"
                >
                  {uploadedPhotos[i] ? (
                    <>
                      <img 
                        src={uploadedPhotos[i]} 
                        alt={`Uploaded photo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                          Main
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                        ×
                      </div>
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
              <li>• Show your face clearly.</li>
              <li>• No filters that significantly alter appearance.</li>
              <li>• Be yourself!</li>
            </ul>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                My Interests (Select up to 5)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      formData.interests.includes(interest)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">Selected: {formData.interests.length}/5</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">About Me (Bio)</label>
              <textarea
                rows={5}
                placeholder="Tell us something interesting about yourself..."
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
              <p className="text-xs text-slate-500 text-right">{formData.bio.length}/500 characters</p>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">I'm interested in</label>
              <select
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.interestedIn}
                onChange={(e) => setFormData({ ...formData, interestedIn: e.target.value })}
              >
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Age Range</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={formData.ageRange[0]}
                  onChange={(e) => setFormData({
                    ...formData,
                    ageRange: [parseInt(e.target.value), formData.ageRange[1]]
                  })}
                  className="w-1/2 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  value={formData.ageRange[1]}
                  onChange={(e) => setFormData({
                    ...formData,
                    ageRange: [formData.ageRange[0], parseInt(e.target.value)]
                  })}
                  className="w-1/2 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-center"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Maximum Distance: <span className="font-semibold text-indigo-400">{formData.maxDistance} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="200"
                value={formData.maxDistance}
                onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader 
        title={`Tell Us About Yourself (${currentStep}/4)`} 
        showBack={currentStep > 1}
        onBack={() => setCurrentStep(currentStep - 1)}
      />
      
      <div className="flex-1 p-6">
        {renderStep()}
        
        <div className="mt-8">
          <Button
            fullWidth
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!formData.name || !formData.dateOfBirth || !formData.gender)) ||
              (currentStep === 2 && uploadedPhotos.length < 2)
            }
          >
            {currentStep === 4 ? 'Finish Setup & Start Matching!' : 'Next Step'}
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </ScreenContainer>
  );
};

export default ProfileSetupScreen;