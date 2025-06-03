import supabase from './supabase';
import { SUPABASE_STORAGE } from './config';

/**
 * Upload a resume file to Supabase storage
 * @param {File} file - The resume file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Object containing path and URL of the uploaded file
 */
export const uploadResume = async (file, userId) => {
  try {
    if (!file || !userId) {
      throw new Error('File and user ID are required');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `users/${userId}/${fileName}`;

    // Upload the file to the resumes bucket
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE.RESUMES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_STORAGE.RESUMES)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

/**
 * Upload a profile picture to Supabase storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Object containing path and URL of the uploaded file
 */
export const uploadProfilePicture = async (file, userId) => {
  try {
    if (!file || !userId) {
      throw new Error('File and user ID are required');
    }

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `profile_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `users/${userId}/${fileName}`;

    // Upload the file to the profile_pictures bucket
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE.PROFILE_PICTURES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Overwrite existing files
      });

    if (error) throw error;

    // Get the URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_STORAGE.PROFILE_PICTURES)
      .getPublicUrl(filePath);

    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase storage
 * @param {string} path - The path of the file to delete
 * @param {string} bucket - The bucket containing the file ('resumes' or 'profile_pictures')
 * @returns {Promise<void>}
 */
export const deleteFile = async (path, bucket) => {
  try {
    if (!path || !bucket) {
      throw new Error('File path and bucket are required');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;

    return data;
  } catch (error) {
    console.error(`Error deleting file from ${bucket}:`, error);
    throw error;
  }
};

/**
 * Get a private file's URL with a signed token (for resume access)
 * @param {string} path - The path of the file
 * @returns {Promise<string>} URL with access token
 */
export const getSignedUrl = async (path) => {
  try {
    const { data, error } = await supabase.storage
      .from(SUPABASE_STORAGE.RESUMES)
      .createSignedUrl(path, 60 * 60); // 1 hour expiry

    if (error) throw error;

    return data.signedUrl;
  } catch (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }
}; 