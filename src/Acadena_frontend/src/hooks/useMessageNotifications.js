import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const useMessageNotifications = (activeConversationId) => {
  const { conversations } = useSelector(state => state.chat);
  const previousUnreadRef = useRef({});
  const notificationPermission = useRef(null);

  // Request notification permission on first use
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermission.current = permission;
        });
      } else {
        notificationPermission.current = Notification.permission;
      }
    }
  }, []);

  // Monitor conversations for new unread messages
  useEffect(() => {
    if (!conversations || conversations.length === 0) return;

    conversations.forEach(conversation => {
      const currentUnread = conversation.unreadCount?.student || conversation.unreadCount?.admin || 0;
      const previousUnread = previousUnreadRef.current[conversation.id] || 0;
      
      // If unread count increased and it's not the active conversation
      if (currentUnread > previousUnread && conversation.id !== activeConversationId) {
        showNotification(conversation);
      }
      
      previousUnreadRef.current[conversation.id] = currentUnread;
    });
  }, [conversations, activeConversationId]);

  const showNotification = (conversation) => {
    // Browser notification
    if (notificationPermission.current === 'granted' && document.hidden) {
      const notification = new Notification('New Message', {
        body: conversation.lastMessage || 'You have a new message',
        icon: '/favicon.ico',
        tag: conversation.id, // Prevent duplicate notifications
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Play notification sound (optional)
    playNotificationSound();
  };

  const playNotificationSound = () => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  return {
    notificationPermission: notificationPermission.current
  };
};

export default useMessageNotifications;
