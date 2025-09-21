import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface User {
  uid: string;
  email: string;
  fullName: string;
  companyName: string;
  phoneNumber: string;
}

export interface SignUpDetails {
    email: string;
    password?: string;
    fullName: string;
    companyName: string;
    phoneNumber: string;
}

export interface SignInCredentials {
    email: string;
    password?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signUp: (details: SignUpDetails) => Promise<boolean>;
  signIn: (credentials: SignInCredentials) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  verifyOtp: (otp: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (details: Partial<User>) => void;
  tempAuthDetails: SignUpDetails | null;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FAKE_USER_DB_KEY = 'finacio_ai_user';
const TEMP_AUTH_KEY = 'finacio_ai_temp_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tempAuthDetails, setTempAuthDetails] = useState<SignUpDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(FAKE_USER_DB_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      const storedTempAuth = localStorage.getItem(TEMP_AUTH_KEY);
      if (storedTempAuth) {
        setTempAuthDetails(JSON.parse(storedTempAuth));
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
      localStorage.removeItem(FAKE_USER_DB_KEY);
      localStorage.removeItem(TEMP_AUTH_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (details: SignUpDetails): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Simulating sign up for:", details.email);
    const tempDetails = { ...details };
    localStorage.setItem(TEMP_AUTH_KEY, JSON.stringify(tempDetails));
    setTempAuthDetails(tempDetails);
    
    setIsLoading(false);
    return true;
  }, []);
  
  const signIn = useCallback(async (credentials: SignInCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, your backend would verify credentials.
    // We'll use a mock user for demonstration.
    if (credentials.email === 'jane.doe@example.com' && credentials.password === 'password123') {
        const mockUser: User = {
            uid: 'email_janedoe',
            email: 'jane.doe@example.com',
            fullName: 'Jane Doe',
            companyName: 'Doe & Co. Creative Agency',
            phoneNumber: '+15551234567'
        };
        localStorage.setItem(FAKE_USER_DB_KEY, JSON.stringify(mockUser));
        setUser(mockUser);
        setIsLoading(false);
        return true;
    } else {
        setError("Invalid email or password.");
        setIsLoading(false);
        return false;
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: User = {
        uid: `google_${Date.now()}`,
        email: 'jane.doe@gmail.com',
        fullName: 'Jane Doe (Google)',
        companyName: 'Google Demo Inc.',
        phoneNumber: '+15551234567'
    };
    
    localStorage.setItem(FAKE_USER_DB_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const verifyOtp = useCallback(async (otp: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (otp !== '123456') {
        setError("Invalid OTP. The correct code is 123456 for this demo.");
        setIsLoading(false);
        return false;
    }
    
    if (!tempAuthDetails) {
        setError("Session expired. Please sign up again.");
        setIsLoading(false);
        return false;
    }

    const newUser: User = {
        uid: `email_${Date.now()}`,
        email: tempAuthDetails.email,
        fullName: tempAuthDetails.fullName,
        companyName: tempAuthDetails.companyName,
        phoneNumber: tempAuthDetails.phoneNumber,
    };

    localStorage.setItem(FAKE_USER_DB_KEY, JSON.stringify(newUser));
    localStorage.removeItem(TEMP_AUTH_KEY);
    setUser(newUser);
    setTempAuthDetails(null);
    setIsLoading(false);
    return true;
  }, [tempAuthDetails]);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset email would be sent to: ${email}`);
    // This is a mock. In a real app, this would be a network request.
    // We don't set an error here to allow the UI to show a success message.
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setTempAuthDetails(null);
    localStorage.removeItem(FAKE_USER_DB_KEY);
    localStorage.removeItem(TEMP_AUTH_KEY);
    // Also clear app data on logout for a clean slate
    localStorage.removeItem('financioAiData');
  }, []);

  const updateUser = useCallback((details: Partial<User>) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const updatedUser = { ...prevUser, ...details };
        localStorage.setItem(FAKE_USER_DB_KEY, JSON.stringify(updatedUser));
        return updatedUser;
    });
  }, []);
  
  const value = useMemo(() => ({ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      error, 
      signUp,
      signIn,
      logout,
      signInWithGoogle,
      verifyOtp,
      updateUser,
      tempAuthDetails,
      sendPasswordResetEmail
    }), [user, isLoading, error, signUp, signIn, logout, signInWithGoogle, verifyOtp, updateUser, tempAuthDetails, sendPasswordResetEmail]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
