import { useState, useEffect } from 'react';
import { internetIdentityService } from '../services/InternetIdentityService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const checkAuthentication = async () => {
    try {
      await internetIdentityService.init();
      
      if (internetIdentityService.isAuthenticated()) {
        const userInfo = await internetIdentityService.getCurrentUser();
        const sessionInfo = internetIdentityService.getCurrentSession();
        
        if (userInfo || sessionInfo) {
          setUser(userInfo);
          setCurrentSession(sessionInfo);
          setIsAuthenticated(true);
          updateSessions();
          console.log('useAuth: User authenticated successfully');
          return userInfo;
        }
      }
    } catch (error) {
      console.log('useAuth: User not authenticated:', error);
      setIsAuthenticated(false);
    }
    return null;
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const sessionInfo = await internetIdentityService.login();
      
      setUser(sessionInfo.userInfo || null);
      setCurrentSession(sessionInfo);
      setIsAuthenticated(true);
      updateSessions();
      
      return sessionInfo.userInfo;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await internetIdentityService.logout();
      setUser(null);
      setCurrentSession(null);
      setIsAuthenticated(false);
      updateSessions();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (principal) => {
    setLoading(true);
    try {
      const sessionInfo = await internetIdentityService.switchToSession(principal);
      const userInfo = await internetIdentityService.getCurrentUser();
      
      setUser(userInfo);
      setCurrentSession(sessionInfo);
      setIsAuthenticated(true);
      updateSessions();
      
      return userInfo;
    } catch (error) {
      console.error('Switch user failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeSession = (principal) => {
    internetIdentityService.removeSession(principal);
    updateSessions();
    
    // If we removed the current session, update state
    if (currentSession?.principal === principal) {
      setUser(null);
      setCurrentSession(null);
      setIsAuthenticated(false);
    }
  };

  const updateSessions = () => {
    const allSessions = internetIdentityService.getAllSessions();
    setSessions(allSessions);
  };

  const getPrincipal = () => {
    return internetIdentityService.getPrincipal();
  };

  const getIdentityAnchor = async () => {
    return await internetIdentityService.getIdentityAnchor();
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
    checkAuthentication,
    
    // Multi-user functionality
    sessions,
    currentSession,
    switchUser,
    removeSession,
    getPrincipal,
    getIdentityAnchor,
    hasMultipleSessions: internetIdentityService.hasMultipleSessions()
  };
};
