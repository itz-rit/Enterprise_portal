import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('fsm_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const { data } = await axios.post(getApiUrl('/api/v1/auth/login'), { phone, password });
    if (data.role !== 'Admin') {
      throw new Error('Access denied. Admin accounts only.');
    }
    localStorage.setItem('fsm_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fsm_user');
    setUser(null);
  };

  const api = (method, path, body, customHeaders = {}) =>
    axios({
      method,
      url: getApiUrl(path),
      data: body,
      headers: {
        ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        ...customHeaders
      },
    });

  return (
    <AuthContext.Provider value={{ user, login, logout, api, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
