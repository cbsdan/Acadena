import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, fetchChatRecipients, fetchConversations } from '../redux/actions/chatAction';
import { useAuth } from '../hooks';
import { findExistingConversation } from '../utils';

const StartConversation = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [receiverId, setReceiverId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const availableRecipients = useSelector(state => state.chat.recipients) || [];
  // Get existing conversations to check for duplicates
  const { conversations } = useSelector(state => state.chat);

  // Fetch available recipients and existing conversations when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchChatRecipients());
      dispatch(fetchConversations()); // Also fetch existing conversations
    }
  }, [dispatch, user]);

  // Debug logging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Available recipients:', availableRecipients);
  }, [user, availableRecipients]);

  const handleStartConversation = async (e) => {
    e.preventDefault();
    if (!receiverId || !message.trim()) return;

    setLoading(true);
    try {
      const userId = String(user.id);
      const recipientId = String(receiverId);

      // Check if conversation already exists with better logic
      const existingConversation = findExistingConversation(conversations, userId, recipientId);

      if (existingConversation) {
        // Conversation already exists, just send message to existing conversation
        console.log('Conversation already exists, sending message to:', existingConversation.id);
        
        const result = await dispatch(sendMessage({
          content: message.trim(),
          receiverId
        }));
        
        if (result.type === 'chat/sendMessage/fulfilled') {
          setMessage('');
          setReceiverId('');
          alert('Message sent to existing conversation!');
        }
        return;
      }

      // If no existing conversation, proceed with creating new one
      console.log('Creating new conversation with:', {
        content: message.trim(),
        receiverId,
        currentUser: user.id
      });

      const result = await dispatch(sendMessage({
        content: message.trim(),
        receiverId
      }));
      
      console.log('Send message result:', result);
      
      if (result.type === 'chat/sendMessage/fulfilled') {
        setMessage('');
        setReceiverId('');
        alert('New conversation created and message sent successfully!');
      } else {
        console.error('Failed to send message:', result.payload || result.error);
        alert('Failed to send message: ' + (result.payload || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="start-conversation">
      <h3>Start New Conversation</h3>
      {availableRecipients.length > 0 ? (
        <form onSubmit={handleStartConversation}>
          <div className="form-group">
            <label htmlFor="recipient">Send to:</label>
            <select
              id="recipient"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              required
            >
              <option value="">Select recipient...</option>
              {availableRecipients.map(recipient => (
                <option key={recipient.id} value={recipient.id}>
                  {recipient.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Message:</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              required
              maxLength={500}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={!receiverId || !message.trim() || loading}
            className="btn-primary"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      ) : (
        <div className="no-recipients">
          <p>No recipients available.</p>
          <p>
            {user?.role?.Student 
              ? "There are no institution admins available to message." 
              : user?.role?.InstitutionAdmin 
              ? "There are no students in your institution to message."
              : "Unable to determine available recipients."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default StartConversation;
