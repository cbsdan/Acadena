import { useState, useEffect } from 'react';
import { internetIdentityService } from '../services/InternetIdentityService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper function to convert BigInt fields to numbers
  const convertBigIntFields = (obj) => {
    if (!obj) return obj;
    
    const converted = { ...obj };
    
    // Convert known BigInt fields to numbers
    if (typeof converted.createdDate === 'bigint') {
      converted.createdDate = Number(converted.createdDate);
    }
    if (converted.lastLoginDate && typeof converted.lastLoginDate === 'bigint') {
      converted.lastLoginDate = Number(converted.lastLoginDate);
    }
    
    return converted;
  };

  const checkAuthentication = async () => {
    try {
      await internetIdentityService.init();

      // Check if user is authenticated with Internet Identity
      if (await internetIdentityService.isAuthenticated()) {
        const actor = internetIdentityService.getActor();
        if (actor) {
          const currentUser = await actor.getCurrentUserInfo();
          if (currentUser && currentUser.length > 0) {
            const convertedUser = convertBigIntFields(currentUser[0]);
            setUser(convertedUser);
            setIsAuthenticated(true);
            return convertedUser;
          }
        }
      }
    } catch (error) {
      console.log('User not authenticated');
      setIsAuthenticated(false);
    }
    return null;
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Initialize the service if not already done
      await internetIdentityService.init();

      // Trigger Internet Identity login flow
      const sessionInfo = await internetIdentityService.login();

      if (sessionInfo && sessionInfo.userInfo) {
        const convertedUser = convertBigIntFields(sessionInfo.userInfo);
        setUser(convertedUser);
        setIsAuthenticated(true);
        return convertedUser;
      } else {
        // User logged in but no user info found in backend
        console.log('User authenticated but no profile found in backend');
        setIsAuthenticated(true);
        return null;
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await internetIdentityService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout locally even if service logout fails
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  return {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    setLoading,
    handleLogin,
    handleLogout,
    checkAuthentication
  };
};
