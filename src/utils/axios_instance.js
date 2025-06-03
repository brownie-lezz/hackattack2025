import axios from "axios";
import supabase from "./supabase";

const baseURL = "http://127.0.0.1:8000/";

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 10000, // 10sec
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

// Add a request interceptor to attach the current session token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get the current session
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    
    // If we have a session, attach the access token
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      // Attempt to refresh the session
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (!refreshError && data.session) {
        // Retry the original request with the new token
        const originalRequest = error.config;
        originalRequest.headers.Authorization = `Bearer ${data.session.access_token}`;
        return axiosInstance(originalRequest);
      } else {
        // If refresh fails, redirect to login
        window.location.href = "/login/";
      }
    }
    
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
