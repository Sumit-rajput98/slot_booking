import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Phone, Shield, Edit2, Save, X, CheckCircle, Trash2, Loader2 } from 'lucide-react';
import { profileAPI } from '../api';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    armyNumber: '',
    name: '',
    mobile: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    armyNumber: '',
    name: '',
    mobile: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load profile on mount - try database first, then fallback to localStorage
  useEffect(() => {
    const loadProfile = async () => {
      const cachedProfile = localStorage.getItem('userProfile');
      if (cachedProfile) {
        const parsed = JSON.parse(cachedProfile);
        setProfile(parsed);
        setEditForm(parsed);
      }
    };
    loadProfile();
  }, []);

  const handleEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({ ...profile });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!editForm.armyNumber.trim()) {
      newErrors.armyNumber = 'Army Number is required';
    }
    if (!editForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!editForm.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^[+]?[0-9\s-]{10,15}$/.test(editForm.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await profileAPI.saveProfile({
        armyNumber: editForm.armyNumber,
        name: editForm.name,
        mobile: editForm.mobile
      });

      // Update local state and cache
      localStorage.setItem('userProfile', JSON.stringify(editForm));
      setProfile(editForm);
      setIsEditing(false);
      toast.success('Profile saved to database successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.error || 'Failed to save profile to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear your profile? This action cannot be undone.')) return;

    if (profile.armyNumber) {
      try {
        await profileAPI.deleteProfile(profile.armyNumber);
        toast.success('Profile deleted from database.');
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }

    localStorage.removeItem('userProfile');
    setProfile({ armyNumber: '', name: '', mobile: '' });
    setEditForm({ armyNumber: '', name: '', mobile: '' });
    setIsEditing(false);
  };

  const hasProfile = profile.armyNumber || profile.name || profile.mobile;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
        <p className="text-gray-600">Manage your personal information</p>
      </div>

      <div className="card">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-500">
                {hasProfile ? 'Your profile is complete' : 'Please complete your profile'}
              </p>
            </div>
          </div>
          
          {hasProfile && !isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Profile Form */}
        {isEditing ? (
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
                value={editForm.armyNumber}
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
                value={editForm.name}
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
                value={editForm.mobile}
                onChange={handleInputChange}
                className={`input-field ${errors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder="Enter your mobile number"
              />
              {errors.mobile && (
                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hasProfile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      Army Number
                    </label>
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{profile.armyNumber}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{profile.name}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                      Mobile Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900 font-medium">{profile.mobile}</span>
                    </div>
                  </div>
                </div>

                {/* Clear Profile Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Profile
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">No profile information found</p>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center mx-auto transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Profile Storage</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Your profile information is used to pre-fill booking forms</li>
          <li>• Data is securely stored in our database</li>
          <li>• You can edit or delete your profile at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePage;
