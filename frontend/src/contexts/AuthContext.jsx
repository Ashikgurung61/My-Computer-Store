import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('techstore_user');
    const savedToken = localStorage.getItem('techstore_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('techstore_user');
        localStorage.removeItem('techstore_token');
      }
    }
    setLoading(false);
  }, []);

  // Save user and token to localStorage whenever they change
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('techstore_user', JSON.stringify(user));
      localStorage.setItem('techstore_token', token);
    } else {
      localStorage.removeItem('techstore_user');
      localStorage.removeItem('techstore_token');
    }
  }, [user, token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const payload = {
        email: credentials.emailOrPhone,
        password: credentials.password,
      };
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { token, user } = data;

      setUser(user);
      setToken(token);

      return { success: true, user };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      const payload = {
        emailOrPhone: userData.emailOrPhone,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
      const response = await fetch('http://127.0.0.1:8000/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      const { token, user } = data;

      setUser(user);
      setToken(token);

      return { success: true, user };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('techstore_user');
    localStorage.removeItem('techstore_token');
  };

  const sendOTP = async (email) => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/send-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    sendOTP,
    isAuthenticated: !!user,
    isAdmin: user?.profile?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

