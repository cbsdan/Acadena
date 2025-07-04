import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, fetchConversations, fetchChatRecipients, debugStudentsWithUserIds, debugAllUsers } from '../redux/actions/chatAction';
import { useAuth } from '../hooks';
import { findExistingConversation } from '../utils';

const NewConversation = ({ onCancel, onConversationCreated }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get available people to chat with from Redux store
  const availableRecipients = useSelector(state => state.chat.recipients) || [];
  // Get existing conversations to check for duplicates
  const { conversations } = useSelector(state => state.chat);

  // Fetch recipients and conversations when component mounts
  useEffect(() => {
    if (user) {
      console.log('Fetching chat recipients for user:', user);
      dispatch(fetchChatRecipients());
      dispatch(fetchConversations()); // Also fetch existing conversations
    }
  }, [dispatch, user]);

  const recipients = availableRecipients;

  // Debug logging
  useEffect(() => {
    console.log('Available recipients in NewConversation:', availableRecipients);
    console.log('Recipients array length:', recipients.length);
    console.log('Current user role:', user?.role);
  }, [availableRecipients, recipients, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !message.trim()) return;

    setLoading(true);
    try {
      const userId = String(user.id);
      const recipientId = String(selectedRecipient);

      // Check if conversation already exists with better logic
      const existingConversation = findExistingConversation(conversations, userId, recipientId);

      if (existingConversation) {
        // Conversation already exists, just navigate to it
        console.log('Conversation already exists, navigating to:', existingConversation.id);
        alert('You already have a conversation with this person. Opening existing conversation...');
        onConversationCreated(existingConversation.id);
        return;
      }

      // If no existing conversation, send the message (which will create one)
      const result = await dispatch(sendMessage({
        content: message.trim(),
        receiverId: selectedRecipient
      }));

      if (result.type === 'chat/sendMessage/fulfilled') {
        // Refresh conversations list to show the new conversation
        await dispatch(fetchConversations());
        // Use the conversation ID from the message response
        const newMessage = result.payload.message;
        onConversationCreated(newMessage.conversationId);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientInitial = (recipient) => {
    return recipient.name.charAt(0).toUpperCase();
  };

  // Debug function
  const handleDebug = async () => {
    console.log('=== DEBUGGING CHAT DATA ===');
    await dispatch(debugStudentsWithUserIds());
    await dispatch(debugAllUsers());
    console.log('Current user:', user);
    console.log('Available recipients:', availableRecipients);
  };

  return (
    <div className="new-conversation">
      <div className="new-conversation-header">
        <h3>Start New Conversation</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={handleDebug}
            style={{ 
              padding: '5px 10px', 
              background: '#f0f0f0', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            Debug
          </button>
          <button className="close-btn" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="new-conversation-content">
        {recipients.length > 0 ? (
          <form onSubmit={handleSendMessage}>
            <div className="recipient-selection">
              <h4>Choose recipient:</h4>
              <div className="recipients-list">
                {recipients.map(recipient => (
                  <div
                    key={recipient.id}
                    className={`recipient-item ${selectedRecipient === recipient.id ? 'selected' : ''}`}
                    onClick={() => setSelectedRecipient(recipient.id)}
                  >
                    <div className="recipient-avatar">
                      {getRecipientInitial(recipient)}
                    </div>
                    <div className="recipient-info">
                      <div className="recipient-name">{recipient.name}</div>
                      <div className="recipient-subtitle">{recipient.role}</div>
                    </div>
                    {selectedRecipient === recipient.id && (
                      <div className="selected-indicator">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedRecipient && (
              <div className="message-input-section">
                <label htmlFor="message">Your message:</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  required
                  maxLength={500}
                />
                <div className="message-actions">
                  <button type="button" onClick={onCancel} className="btn-secondary">
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={!message.trim() || loading}
                    className="btn-primary"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          <div className="no-recipients">
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>No one to chat with</h4>
              <p>
                {user?.role?.Student 
                  ? "No institutions available to contact" 
                  : "No students available in your institution"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewConversation;
