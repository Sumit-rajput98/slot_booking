import http from './http';

export const profileAPI = {
  // Get profile by army number
  getProfile: (armyNumber) => http.get(`/profile/${armyNumber}`),

  // Create or update profile
  saveProfile: (profileData) => http.post('/profile', profileData),

  // Delete profile
  deleteProfile: (armyNumber) => http.delete(`/profile/${armyNumber}`),
};
