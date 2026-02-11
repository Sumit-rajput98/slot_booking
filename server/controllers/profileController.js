const { supabase } = require('../config');

// Get profile by army number
const getProfile = async (req, res) => {
  try {
    const { armyNumber } = req.params;
    
    const { data, error } = await supabase
      .from('public_profile')
      .select('*')
      .eq('army_number', armyNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json({
      armyNumber: data.army_number,
      name: data.name,
      mobile: data.mobile,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Create or update profile
const saveProfile = async (req, res) => {
  try {
    const { armyNumber, name, mobile } = req.body;
    
    if (!armyNumber || !name || !mobile) {
      return res.status(400).json({ 
        error: 'Army number, name, and mobile are required' 
      });
    }
    
    // Check if profile exists (handle case where .single() throws when not found)
    let existingProfile = null;
    try {
      const { data, error } = await supabase
        .from('public_profile')
        .select('id')
        .eq('army_number', armyNumber)
        .single();
      
      if (data) existingProfile = data;
      // PGRST116 = no rows found, which is fine
      if (error && error.code !== 'PGRST116') throw error;
    } catch (checkError) {
      console.error('Error checking existing profile:', checkError);
      // Continue as if no profile exists
    }
    
    let result;
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('public_profile')
        .update({
          name,
          mobile,
          updated_at: new Date().toISOString()
        })
        .eq('army_number', armyNumber)
        .select()
        .single();
    } else {
      // Create new profile
      result = await supabase
        .from('public_profile')
        .insert({
          army_number: armyNumber,
          name,
          mobile,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Supabase error:', result.error);
      throw result.error;
    }
    
    res.json({
      message: 'Profile saved successfully',
      profile: {
        armyNumber: result.data.army_number,
        name: result.data.name,
        mobile: result.data.mobile,
        createdAt: result.data.created_at,
        updatedAt: result.data.updated_at
      }
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ 
      error: 'Failed to save profile',
      details: error.message 
    });
  }
};

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const { armyNumber } = req.params;
    
    const { error } = await supabase
      .from('public_profile')
      .delete()
      .eq('army_number', armyNumber);
    
    if (error) {
      throw error;
    }
    
    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ error: 'Failed to delete profile' });
  }
};

module.exports = {
  getProfile,
  saveProfile,
  deleteProfile
};
