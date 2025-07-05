import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { fetchConversations, fetchConversationsBackground } from '../redux/actions/chatAction';

const useRealTimeConversations = (isActive = true) => {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);
  const isActiveRef = useRef(isActive);
  const hasInitialLoad = useRef(false);

  // Update active status
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const refreshConversations = async () => {
    if (!isActiveRef.current) return;

    try {
      // Always use background fetch for real-time updates (no loading indicators)
      await dispatch(fetchConversationsBackground());
    } catch (error) {
      console.error('Error refreshing conversations:', error);
    }
  };

  // Start polling when component mounts
  useEffect(() => {
    if (!isActive) return;

    // Only do initial fetch if we haven't done it before
    if (!hasInitialLoad.current) {
      dispatch(fetchConversations());
      hasInitialLoad.current = true;
    }

    // Set up polling interval (every 10 seconds) - always use background fetch
    intervalRef.current = setInterval(refreshConversations, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, dispatch]);

  // Stop polling when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isPolling: !!intervalRef.current,
    refreshConversations
  };
};

export default useRealTimeConversations;
