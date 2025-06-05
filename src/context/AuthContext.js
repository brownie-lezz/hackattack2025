import { createContext, useState, useEffect } from "react";
import supabase from "../utils/supabase";
import { SUPABASE_TABLES } from "../utils/config";

const AuthContext = createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile data based on their role
  const loadUserProfile = async (userId, role) => {
    try {
      // First, get base profile
      const { data: baseProfile, error: baseError } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .select('*')
        .eq('id', userId)
        .single();
        
      if (baseError) throw baseError;
      
      // Then get role-specific profile
      const profileTable = role === 'seeker' ? SUPABASE_TABLES.SEEKER_PROFILES : SUPABASE_TABLES.EMPLOYER_PROFILES;
      const { data: roleProfile, error: roleError } = await supabase
        .from(profileTable)
        .select('*')
        .eq('id', userId)
        .single();
        
      if (roleError && roleError.code !== 'PGRST116') { // PGRST116 is "not found" which is ok initially
        throw roleError;
      }
      
      // Combine profiles
      return {
        ...baseProfile,
        ...(roleProfile || {})
      };
    } catch (error) {
      console.error("Error loading user profile:", error);
      return null;
    }
  };

  useEffect(() => {
    // Check for active session when the component mounts
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session) {
          // Get the role from user metadata
          const role = session.user.user_metadata?.role || 'seeker';
          
          // Get user profile
          const userProfile = await loadUserProfile(session.user.id, role);
            
          if (userProfile) {
            // Combine auth data with profile data
            setUser({
              ...session.user,
              ...userProfile
            });
          } else {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Get the role from user metadata
          const role = session.user.user_metadata?.role || 'seeker';
          
          // Get user profile
          const userProfile = await loadUserProfile(session.user.id, role);
            
          if (userProfile) {
            setUser({
              ...session.user,
              ...userProfile
            });
          } else {
            setUser(session.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const createUserProfile = async (userId, userData) => {
    try {
      // Create base profile record
      const baseProfileData = {
        id: userId,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '', // Make phone optional
        profile_picture_url: userData.profile_picture_url || '' // Add profile picture support
      };
      
      const { error: profileError } = await supabase
        .from(SUPABASE_TABLES.PROFILES)
        .insert([baseProfileData]);
        
      if (profileError) throw profileError;
      
      // Create role-specific profile
      if (userData.role === 'seeker') {
        const seekerData = {
          id: userId,
          job_title: userData.job_title || '',
          experience: userData.experience || '',
          skills: userData.skills || [],
          location: userData.location || '',
          resume_url: userData.resume_url || ''
        };
        
        const { error: seekerError } = await supabase
          .from(SUPABASE_TABLES.SEEKER_PROFILES)
          .insert([seekerData]);
          
        if (seekerError) throw seekerError;
        
      } else if (userData.role === 'employer') {
        const employerData = {
          id: userId,
          industry: userData.industry || '',
          company_size: userData.company_size || '',
          company_website: userData.company_website || '',
          company_location: userData.company_location || '',
          company_description: userData.company_description || '',
          contact_person: userData.contact_person || ''
        };
        
        const { error: employerError } = await supabase
          .from(SUPABASE_TABLES.EMPLOYER_PROFILES)
          .insert([employerData]);
          
        if (employerError) throw employerError;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error creating profile:", error);
      return { error };
    }
  };

  const contextValue = {
    user,
    loading,
    setUser,
    signIn: async (email, password) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        return { data, error: null };
      } catch (error) {
        console.error("Error signing in:", error);
        return { data: null, error };
      }
    },
    signUp: async (email, password, userData) => {
      try {
        // Register the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              role: userData.role,
              name: userData.name
            },
            emailRedirectTo: `${window.location.origin}/login` // Redirect to login after email verification
          }
        });
        
        if (error) throw error;
        
        // Create user profiles
        if (data.user) {
          // Use a short delay to ensure the auth record is fully committed
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { error: profileError } = await createUserProfile(data.user.id, {
            ...userData,
            email
          });
            
          if (profileError) throw profileError;
        }
        
        return { data, error: null };
      } catch (error) {
        console.error("Error signing up:", error);
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        return { error: null };
      } catch (error) {
        console.error("Error signing out:", error);
        return { error };
      }
    },
    resetPassword: async (email) => {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password-confirm`,
        });
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error("Error resetting password:", error);
        return { error };
      }
    },
    updatePassword: async (newPassword) => {
      try {
        const { error } = await supabase.auth.updateUser({ 
          password: newPassword 
        });
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error("Error updating password:", error);
        return { error };
      }
    },
    updateProfile: async (profileData) => {
      if (!user) {
        return { error: new Error("No user logged in") };
      }

      try {
        const role = user.role;
        
        // Update base profile
        const baseProfileData = {
          name: profileData.name,
          phone: profileData.phone,
          profile_picture_url: profileData.profile_picture_url || user.profile_picture_url // Add profile picture support
        };
        
        const { error: baseError } = await supabase
          .from(SUPABASE_TABLES.PROFILES)
          .update(baseProfileData)
          .eq('id', user.id);
          
        if (baseError) throw baseError;
        
        // Update role-specific profile
        if (role === 'seeker') {
          const { job_title, experience, skills, location, resume_url } = profileData;
          const seekerData = { job_title, experience, skills, location, resume_url };
          
          const { error: seekerError } = await supabase
            .from(SUPABASE_TABLES.SEEKER_PROFILES)
            .update(seekerData)
            .eq('id', user.id);
            
          if (seekerError) throw seekerError;
        } else if (role === 'employer') {
          const { 
            industry, 
            company_size, 
            company_website, 
            company_location, 
            company_description, 
            contact_person 
          } = profileData;
          
          const employerData = { 
            industry, 
            company_size, 
            company_website, 
            company_location, 
            company_description, 
            contact_person 
          };
          
          const { error: employerError } = await supabase
            .from(SUPABASE_TABLES.EMPLOYER_PROFILES)
            .update(employerData)
            .eq('id', user.id);
            
          if (employerError) throw employerError;
        }
        
        // Update local user state
        setUser({ ...user, ...profileData });
        
        return { error: null };
      } catch (error) {
        console.error("Error updating profile:", error);
        return { error };
      }
    },
    resendConfirmationEmail: async (email) => {
      try {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });
        
        if (error) throw error;
        return { error: null };
      } catch (error) {
        console.error("Error resending confirmation email:", error);
        return { error };
      }
    }
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
