import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage } from '../redux/actions/chatAction';
import { markAsRead } from '../redux/reducers/chatReducer';
import { useAuth } from '../hooks';

const ChatWindow = ({ conversationId }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { messages, loading } = useSelector(state => state.chat);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const conversationMessages = messages[conversationId] || [];

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
      dispatch(markAsRead({ conversationId }));
    }
  }, [conversationId, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getReceiverId = () => {
    // Instead of parsing conversation ID (which can be inconsistent), 
    // we should look at the conversation data or messages to determine the receiver
    if (!user || !user.id || !conversationId) return '';
    
    // Try to get receiver from the conversation messages
    const conversationMessages = messages[conversationId] || [];
    if (conversationMessages.length > 0) {
      // Find the most recent message and determine who the "other" user is
      const lastMessage = conversationMessages[conversationMessages.length - 1];
      const currentUserId = String(user.id);
      
      // If I sent the last message, the receiver is the receiverId from that message
      // If someone else sent it, the receiver is the senderId from that message
      if (lastMessage.senderId === currentUserId) {
        return lastMessage.receiverId;
      } else {
        return lastMessage.senderId;
      }
    }
    
    // Fallback: try to parse from conversation ID (old logic as backup)
    const parts = conversationId.split('_');
    if (parts.length === 2) {
      const [user1, user2] = parts;
      return user1 === String(user.id) ? user2 : user1;
    }
    
    return '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const receiverId = getReceiverId();
      await dispatch(sendMessage({
        content: newMessage.trim(),
        receiverId
      }));
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message) => {
    if (!user || !user.id) return false;
    return message.senderId === String(user.id);
  };

  const getMessageStatus = (message) => {
    if (!isMyMessage(message)) return null;
    return message.isRead ? '✓✓' : '✓';
  };

  const getMessageStatusClass = (message) => {
    if (!isMyMessage(message)) return '';
    return message.isRead ? 'read' : 'unread';
  };

  if (loading && conversationMessages.length === 0) {
    return (
      <div className="chat-window-loading">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="chat-window-loading">
        <div className="loading-spinner"></div>
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-messages">
        {conversationMessages.length > 0 ? (
          conversationMessages.map((message) => (
            <div
              key={message.id}
              className={`message ${isMyMessage(message) ? 'own-message' : 'other-message'}`}
            >
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-footer">
                <span className="message-timestamp">
                  {formatTimestamp(message.timestamp)}
                </span>
                {isMyMessage(message) && (
                  <span className={`read-status ${getMessageStatusClass(message)}`}>
                    {getMessageStatus(message)}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-messages">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h4>No messages yet</h4>
              <p>Start the conversation by sending a message below</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <div className="message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            disabled={sending}
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="send-button"
          >
            {sending ? (
              <div className="button-spinner"></div>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="send-icon">
                <path d="m22 2-7 20-4-9-9-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="m22 2-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
