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
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('techstore_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('techstore_user');
      }
    }
    setLoading(false);
  }, []);

  // Save user to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('techstore_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('techstore_user');
    }
  }, [user]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate login validation
      const { emailOrPhone, password } = credentials;
      
      if (!emailOrPhone || !password) {
        throw new Error('Email/Phone and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Invalid credentials');
      }
      
      // Create user object
      const userData = {
        id: Date.now(),
        email: emailOrPhone.includes('@') ? emailOrPhone : null,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : null,
        name: emailOrPhone.includes('@') 
          ? emailOrPhone.split('@')[0] 
          : `User${emailOrPhone.slice(-4)}`,
        loginTime: new Date().toISOString()
      };
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { emailOrPhone, password, confirmPassword, otp } = userData;
      
      // Validation
      if (!emailOrPhone || !password || !confirmPassword) {
        throw new Error('All fields are required');
      }
      
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      if (!otp || otp !== '123456') {
        throw new Error('Invalid OTP. Use 123456 for demo');
      }
      
      // Create user object
      const newUser = {
        id: Date.now(),
        email: emailOrPhone.includes('@') ? emailOrPhone : null,
        phone: !emailOrPhone.includes('@') ? emailOrPhone : null,
        name: emailOrPhone.includes('@') 
          ? emailOrPhone.split('@')[0] 
          : `User${emailOrPhone.slice(-4)}`,
        signupTime: new Date().toISOString()
      };
      
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('techstore_user');
  };

  const sendOTP = async (emailOrPhone) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!emailOrPhone) {
        throw new Error('Email or phone number is required');
      }
      
      // Simulate OTP sending
      console.log(`OTP sent to ${emailOrPhone}: 123456`);
      return { success: true, message: 'OTP sent successfully. Use 123456 for demo.' };
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    sendOTP,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

