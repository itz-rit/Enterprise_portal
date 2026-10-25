import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getApiUrl } from '../config/api';

export const StaffAuthContext = createContext();
export const StaffAuthProvider = ({ children }) => {
  const [staffUser, setStaffUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = staffUser?.token;

  useEffect(() => {
    const stored = localStorage.getItem('fsm_staff');
    if (stored) setStaffUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const { data } = await axios.post(getApiUrl('/api/v1/auth/login'), { phone, password });
    if (data.role !== 'Staff') {
      throw new Error('This portal is for Staff only. Admins use the main panel.');
    }
    localStorage.setItem('fsm_staff', JSON.stringify(data));
    setStaffUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('fsm_staff');
    setStaffUser(null);
  };

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const { data } = await axios.get(getApiUrl('/api/staff/profile'), {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
    });
    let merged = { ...data, token };
    setStaffUser((current) => {
      merged = { ...(current || {}), ...data, token };
      localStorage.setItem('fsm_staff', JSON.stringify(merged));
      return merged;
    });
    return merged;
  }, [token]);

  const api = useCallback((method, path, body, customHeaders = {}) =>
    axios({
      method,
      url: getApiUrl(path),
      data: body,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...customHeaders
      },
    }), [token]);

  return (
    <StaffAuthContext.Provider value={{ staffUser, login, logout, api, refreshProfile, loading }}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = () => useContext(StaffAuthContext);
