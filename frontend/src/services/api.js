import axios from "axios";

const API_BASE_URL = "http://localhost";

export const onboardingAPI = axios.create({
  baseURL: `${API_BASE_URL}:4002/api/onboarding`
});

export const authAPI = axios.create({
  baseURL: `${API_BASE_URL}:4000/api/auth`
});

export const workflowAPI = axios.create({
  baseURL: `${API_BASE_URL}:4001/api/workflows`
});

// Add response for better error handling @abhinav
onboardingAPI.interceptors.response.use(
  response => response,
  error => {
    console.error("Onboarding API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

authAPI.interceptors.response.use(
  response => response,
  error => {
    console.error("Auth API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

workflowAPI.interceptors.response.use(
  response => response,
  error => {
    console.error("Workflow API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Export helper functions for common operations @abhinav
export const apiHelpers = {
  getAuthToken: () => localStorage.getItem("token"),
  getUserId: () => localStorage.getItem("userId"),
  getUserRole: () => localStorage.getItem("role"),
  isAuthenticated: () => !!localStorage.getItem("token"),
  isAdmin: () => localStorage.getItem("role")?.toUpperCase() === "ADMIN",
  isManager: () => localStorage.getItem("role")?.toUpperCase() === "MANAGER",
  isEmployee: () => localStorage.getItem("role")?.toUpperCase() === "EMPLOYEE"
};
