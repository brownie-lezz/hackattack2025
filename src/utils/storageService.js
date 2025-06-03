import supabase from './supabase';

/**
 * Service for handling file uploads and storage with Supabase
 */
export const storageService = {
  /**
   * Upload a resume file to Supabase Storage
   * 
   * @param {File} file - The resume file to upload
   * @param {string} userId - The user ID to associate with the file
   * @returns {Promise<Object>} - Upload result with file path and URL
   */
  uploadResume: async (file, userId) => {
    try {
      // Create a unique file name with original extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;
      const filePath = `users/${userId}/${fileName}`;

      // Upload the file
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);

      if (error) throw error;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      return { 
        success: true,
        path: filePath, 
        url: publicUrl,
        error: null 
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      return { 
        success: false, 
        path: null,
        url: null,
        error: error.message || 'Failed to upload file' 
      };
    }
  },

  /**
   * Download a resume file from Supabase Storage
   * 
   * @param {string} path - The storage path of the file
   * @returns {Promise<Object>} - Download result with file data
   */
  downloadResume: async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(path);

      if (error) throw error;

      return { 
        success: true,
        data,
        error: null 
      };
    } catch (error) {
      console.error('Error downloading resume:', error);
      return { 
        success: false, 
        data: null,
        error: error.message || 'Failed to download file' 
      };
    }
  },

  /**
   * Delete a resume file from Supabase Storage
   * 
   * @param {string} path - The storage path of the file
   * @returns {Promise<Object>} - Delete result
   */
  deleteResume: async (path) => {
    try {
      const { error } = await supabase.storage
        .from('resumes')
        .remove([path]);

      if (error) throw error;

      return { 
        success: true,
        error: null 
      };
    } catch (error) {
      console.error('Error deleting resume:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to delete file' 
      };
    }
  },

  /**
   * Create a signed URL for temporary access to a file
   * 
   * @param {string} path - The storage path of the file
   * @param {number} expiresIn - Seconds until the URL expires (default: 60)
   * @returns {Promise<Object>} - Signed URL result
   */
  getSignedUrl: async (path, expiresIn = 60) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(path, expiresIn);

      if (error) throw error;

      return { 
        success: true,
        signedUrl: data.signedUrl,
        error: null 
      };
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return { 
        success: false, 
        signedUrl: null,
        error: error.message || 'Failed to create signed URL' 
      };
    }
  }
}; 