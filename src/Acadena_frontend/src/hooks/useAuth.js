import { useState, useEffect } from 'react';
import { internetIdentityService } from '../services/InternetIdentityService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAuthentication = async () => {
    try {
      await internetIdentityService.init();

      // Check if user is authenticated with Internet Identity
      if (await internetIdentityService.isAuthenticated()) {
        const actor = internetIdentityService.getActor();
        if (actor) {
          const currentUser = await actor.getCurrentUserInfo();
          if (currentUser && currentUser.length > 0) {
            setUser(currentUser[0]);
            setIsAuthenticated(true);
            return currentUser[0];
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
        setUser(sessionInfo.userInfo);
        setIsAuthenticated(true);
        return sessionInfo.userInfo;
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
