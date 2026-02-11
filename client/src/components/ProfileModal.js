import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Phone, Shield, X, CheckCircle } from 'lucide-react';
import { profileAPI } from '../api';

const ProfileModal = ({ isOpen, onClose, onSave, isRequired = false }) => {
  const [profile, setProfile] = useState({
    armyNumber: '',
    name: '',
    mobile: ''
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Load existing profile from localStorage (fallback) or check if previously saved
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!profile.armyNumber.trim()) {
      newErrors.armyNumber = 'Army Number is required';
    }
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!profile.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^[+]?[0-9\s-]{10,15}$/.test(profile.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const response = await profileAPI.saveProfile({
        armyNumber: profile.armyNumber,
        name: profile.name,
        mobile: profile.mobile
      });

      // Also save to localStorage as backup/cache
      localStorage.setItem('userProfile', JSON.stringify(profile));

      toast.success('Profile saved to database!');
      onSave(profile);
    } catch (error) {
      console.error('Database save failed, using localStorage:', error);
      
      // Fallback: Save to localStorage only
      localStorage.setItem('userProfile', JSON.stringify(profile));
      toast.success('Profile saved locally (database unavailable)');
      onSave(profile);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-white mr-2" />
            <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
          </div>
          <button
            onClick={handleSkip}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 mb-6 text-sm">
            Please fill in your details to proceed with booking. All fields are required.
          </p>

          <div className="space-y-4">
            {/* Army Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Shield className="h-4 w-4 inline mr-1" />
                Army Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="armyNumber"
                value={profile.armyNumber}
                onChange={handleInputChange}
                className={`input-field ${errors.armyNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your Army Number"
              />
              {errors.armyNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.armyNumber}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={profile.mobile}
                onChange={handleInputChange}
                className={`input-field ${errors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your mobile number"
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          {!isRequired && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Skip for now
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
