import { useState, useEffect } from 'react';
import { Acadena_backend } from 'declarations/Acadena_backend';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAuthentication = async () => {
    try {
      const currentUser = await Acadena_backend.getCurrentUserInfo();
      if (currentUser && currentUser.length > 0) {
        setUser(currentUser[0]);
        setIsAuthenticated(true);
        return currentUser[0];
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
      const user = await checkAuthentication();
      return user;
    } catch (error) {
      alert('Please authenticate with Internet Identity first');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
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
