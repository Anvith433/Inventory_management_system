import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');

    if (savedUser) {
      setUser(JSON.parse(savedUser));

      if (savedToken) {
        api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      }
    }

    setLoading(false);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Fetch user failed:', err);
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const res = await api.post('/api/auth/login', credentials);

      console.log("LOGIN RAW RESPONSE:", res.data);
      console.log("TOKEN RECEIVED FROM BACKEND:", res.data.token);

      const token = res.data.token;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userData = {
        customer_id: res.data.customer_id || res.data.customerId,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role || 'ROLE_USER',
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      try {
        await fetchUser();
      } catch (meErr) {
        console.warn('/api/auth/me unavailable or failed, using login payload:', meErr);
      }

      return userData;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post('/api/auth/register', data);
      return res.data;
    } catch (err) {
      console.error('Registration failed:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider
      // 🎯 ADDED setUser HERE TO VALUE OBJECT
      value={{ user, setUser, login, logout, register, fetchUser, isLoggedIn, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);