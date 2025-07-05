import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, fetchConversationsBackground } from '../redux/actions/chatAction';

const useRealTimeChat = (conversationId, isActive = true) => {
  const dispatch = useDispatch();
  const { messages } = useSelector(state => state.chat);
  const intervalRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const isActiveRef = useRef(isActive);

  // Update active status
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Get current message count for this conversation
  const currentMessages = messages[conversationId] || [];
  const currentMessageCount = currentMessages.length;

  const checkForNewMessages = useCallback(async () => {
    if (!conversationId || !isActiveRef.current) return;

    try {
      // Fetch messages for the current conversation
      await dispatch(fetchMessages(conversationId));
      
      // Also refresh conversations list occasionally to update unread counts (silent)
      if (Math.random() < 0.2) { // 20% chance to refresh conversations
        await dispatch(fetchConversationsBackground());
      }
    } catch (error) {
      console.error('Error checking for new messages:', error);
    }
  }, [conversationId, dispatch]);

  // Start polling when component mounts or conversationId changes
  useEffect(() => {
    if (!conversationId || !isActive) return;

    // Initial fetch
    checkForNewMessages();

    // Set up polling interval (every 5 seconds for active conversation)
    intervalRef.current = setInterval(checkForNewMessages, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [conversationId, isActive, checkForNewMessages]);

  // Track message count changes for notifications
  useEffect(() => {
    if (currentMessageCount > lastMessageCountRef.current && lastMessageCountRef.current > 0) {
      // New messages received, could trigger notification sound here
      console.log('New message received in conversation:', conversationId);
    }
    lastMessageCountRef.current = currentMessageCount;
  }, [currentMessageCount, conversationId]);

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
    messageCount: currentMessageCount,
    refreshMessages: checkForNewMessages
  };
};

export default useRealTimeChat;
