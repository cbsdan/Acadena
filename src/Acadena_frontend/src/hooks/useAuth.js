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
        
        // Set authentication state even if user data is null (new user case)
        setUser(userInfo);
        setCurrentSession(sessionInfo);
        setIsAuthenticated(true);
        updateSessions();
        
        if (userInfo) {
          console.log('useAuth: User authenticated with data:', userInfo);
        } else {
          console.log('useAuth: User authenticated but no user data (new user)');
        }
        
        return userInfo;
      } else {
        console.log('useAuth: User not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        setCurrentSession(null);
      }
    } catch (error) {
      console.log('useAuth: Authentication check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      setCurrentSession(null);
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

  // Function to reload current user data
  const loadCurrentUser = async () => {
    try {
      if (internetIdentityService.isAuthenticated()) {
        console.log('🔄 loadCurrentUser: Reloading user data...');
        console.log('🔑 Current principal:', internetIdentityService.getPrincipal());
        console.log('🔑 Has current identity:', !!internetIdentityService.getIdentity());
        
        // Check if we have a session before attempting to update
        const currentSession = internetIdentityService.getCurrentSession();
        console.log('🔍 Current session exists:', !!currentSession);
        
        // Use the new updateSessionWithUserInfo method to refresh user data in both session and auth state
        const userInfo = await internetIdentityService.updateSessionWithUserInfo();
        
        if (userInfo) {
          console.log('✅ loadCurrentUser: User data reloaded successfully:', userInfo);
          setUser(userInfo);
          return userInfo;
        } else {
          console.log('⚠️ loadCurrentUser: No user data found after reload');
          // Still update the user state with null to ensure consistent state
          setUser(null);
        }
      } else {
        console.log('⚠️ loadCurrentUser: Not authenticated, cannot reload user data');
      }
    } catch (error) {
      console.error('❌ loadCurrentUser: Failed to reload user data:', error);
    }
    return null;
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
    loadCurrentUser,
    
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
