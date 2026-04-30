import api from './api';



// Login function
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set default auth header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Register function
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    }
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  return null;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Check if authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Check if user has specific role
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user?.role === role;
};

// Export all functions as an object for convenience
export const userService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  isAuthenticated,
  hasRole
};