import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục session từ localStorage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const { data } = await axiosClient.post('/auth/login', { username, password });
      
      // Lưu token & user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      return { success: true };
    } catch (error) {
       return { 
         success: false, 
         message: error.response?.data?.message || 'Lỗi kết nối máy chủ' 
       };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Các helper kiểm tra quyền
  const isAdmin = () => user?.role === 'ADMIN';
  const isManager = () => user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isStaff = () => user?.role === 'STAFF';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isManager, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
