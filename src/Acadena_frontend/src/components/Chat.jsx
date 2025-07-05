import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConversations } from '../redux/actions/chatAction';
import { fetchAllStudents } from '../redux/actions/studentAction';
import { fetchAllInstitutions } from '../redux/actions/institutionsAction';
import { setActiveConversation } from '../redux/reducers/chatReducer';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import NewConversation from './NewConversation';
import { useAuth, useRealTimeConversations, useMessageNotifications } from '../hooks';
import './assets/styles/chat.css';

const Chat = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { conversations, activeConversation, loading, unreadCount } = useSelector(state => state.chat);
  const [showNewConversation, setShowNewConversation] = useState(false);
  
  // Enable real-time conversation updates
  useRealTimeConversations(true);
  
  // Enable message notifications
  useMessageNotifications(activeConversation);
  
  useEffect(() => {
    dispatch(fetchConversations());
    // Fetch available people to chat with
    if (user?.role?.InstitutionAdmin) {
      dispatch(fetchAllStudents());
    } else if (user?.role?.Student) {
      dispatch(fetchAllInstitutions());
    }
  }, [dispatch, user]);

  const handleConversationSelect = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    setShowNewConversation(false);
  };

  const handleNewConversationClick = () => {
    setShowNewConversation(true);
    dispatch(setActiveConversation(null));
  };

  const handleNewConversationCancel = () => {
    setShowNewConversation(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Messages</h2>
          <div className="chat-header-actions">
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
            <button 
              className="new-chat-btn"
              onClick={handleNewConversationClick}
              title="Start new conversation"
            >
              <svg viewBox="0 0 24 24" fill="none" className="new-chat-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7v6m-3-3h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        <ConversationList 
          conversations={conversations} 
          loading={loading} 
          onConversationSelect={handleConversationSelect}
          activeConversation={activeConversation}
        />
      </div>
      
      <div className="chat-main">
        {showNewConversation ? (
          <NewConversation 
            onCancel={handleNewConversationCancel}
            onConversationCreated={handleConversationSelect}
          />
        ) : activeConversation ? (
          <ChatWindow conversationId={activeConversation} />
        ) : (
          <div className="chat-empty">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Welcome to Messages</h3>
              <p>Select a conversation from the sidebar or start a new one</p>
              <button 
                className="btn-primary start-chat-btn"
                onClick={handleNewConversationClick}
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
