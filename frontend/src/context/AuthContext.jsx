import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);


const API = axios.create({
  baseURL: 'http://localhost:4000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ew_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const storedUser  = localStorage.getItem('ew_user');
    const storedToken = localStorage.getItem('ew_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('ew_user');
        localStorage.removeItem('ew_token');
      }
    }
    setLoading(false);
  }, []);

  
  const saveUser = (token, userData) => {
    localStorage.setItem('ew_token', token);
    localStorage.setItem('ew_user', JSON.stringify(userData));
    setUser(userData);
  };

  
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      saveUser(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      return { success: true, role: data.user.role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your email and password.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  
  const signup = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      saveUser(data.token, data.user);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed. Try again.';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  
  const loginWithGoogle = async (credentialResponse) => {
    setLoading(true);
    try {
      
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded   = JSON.parse(window.atob(base64));

      
      const { data } = await API.post('/auth/google', {
        name:     decoded.name,
        email:    decoded.email,
        googleId: decoded.sub,
        avatar:   decoded.picture,
      });

      saveUser(data.token, data.user);
      toast.success(`Welcome, ${data.user.name.split(' ')[0]}!`);
      return { success: true, role: data.user.role };

    } catch (err) {
      const msg = err.response?.data?.message || 'Google login failed. Try again.';
      toast.error(msg);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

 
  const logout = () => {
    localStorage.removeItem('ew_token');
    localStorage.removeItem('ew_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

 
  const updateProfile = async (profileData) => {
    try {
      const { data } = await API.put('/auth/update-profile', profileData);
      const updated  = { ...user, ...data.user };
      localStorage.setItem('ew_user', JSON.stringify(updated));
      setUser(updated);
      toast.success('Profile updated!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, loginWithGoogle,
      logout, signup, updateProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);