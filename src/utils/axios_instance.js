import axios from "axios";

// Use environment variable with fallback to localhost
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000/";

const removeTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000, // 30 seconds
  headers: {
    Authorization: localStorage.getItem("access_token")
      ? "JWT " + localStorage.getItem("access_token")
      : null,
    accept: "application/json",
  },
  withCredentials: false, // Changed to false as we're using JWT
});

// Add request interceptor to handle content type and logging
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the request configuration
    console.log('Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });

    // Only set Content-Type if it's not already set (for file uploads)
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    // Ensure Authorization header is set if token exists
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = "JWT " + token;
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Enhanced error logging
    console.error('Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data instanceof FormData ? 'FormData' : error.config?.data
      }
    });

    if (typeof error.response === "undefined") {
      // Check if it's a CORS error
      if (error.message.includes('Network Error')) {
        alert(
          "Unable to connect to the server. Please ensure:\n" +
          "1. The backend server is running on http://localhost:8000\n" +
          "2. You are logged in with valid credentials\n" +
          "3. Your browser's CORS settings are not blocking the request"
        );
      } else {
        alert(
          "A server/network error occurred. " +
          "Please check if the server is running and accessible. " +
          "Error details: " + error.message
        );
      }
      return Promise.reject(error);
    }

    if (
      error.response.status === 401 &&
      originalRequest.url === baseURL + "auth/jwt/refresh/"
    ) {
      window.location.href = "/login/";
      return Promise.reject(error);
    }

    if (
      error.response.data.code === "token_not_valid" &&
      error.response.status === 401 &&
      error.response.statusText === "Unauthorized"
    ) {
      let refreshToken = localStorage.getItem("refresh_token");
      
      // For unknown reasons, refresh_token was stored as 'undefined'(string). If this occurs delete the tokens 
      if (refreshToken === 'undefined') {
        console.log("refresh token is undefined");
        removeTokens()
        // set refreshToken to falsy value so that below if's don't execute
        refreshToken = false
      }
      
      if (refreshToken) {
        const tokenParts = JSON.parse(atob(refreshToken.split(".")[1]));

        // exp date in token is expressed in seconds, while now() returns milliseconds:
        const now = Math.ceil(Date.now() / 1000);
        // console.log(tokenParts.exp);

        if (tokenParts.exp > now) {
          return axiosInstance
            .post("auth/jwt/refresh/", {
              refresh: refreshToken,
            })
            .then((response) => {
              localStorage.setItem("access_token", response.data.access);
              localStorage.setItem("refresh_token", response.data.refresh);

              axiosInstance.defaults.headers["Authorization"] =
                "JWT " + response.data.access;
              originalRequest.headers["Authorization"] =
                "JWT " + response.data.access;

              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          console.log("Refresh token is expired", tokenParts.exp, now);
          removeTokens()
          window.location.href = "/login/";
        }
      } else {
        console.log("Refresh token not available.");
        window.location.href = "/login/";
      }
    }

    // specific error handling done elsewhere
    return Promise.reject(error);
  }
);

export default axiosInstance;
