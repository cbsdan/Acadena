import React from 'react';
import { useAuth } from '../hooks';

const ConversationList = ({ conversations, loading, onConversationSelect, activeConversation }) => {
  const { user } = useAuth();

  const getOtherPartyName = (conversation) => {
    // Determine who is the "other party" based on current user role
    if (user?.role?.Student) {
      // If current user is a student, show institution admin name
      return `Admin - Institution ${conversation.institutionId}`;
    } else if (user?.role?.InstitutionAdmin) {
      // If current user is institution admin, show student name
      return `Student ${conversation.studentId}`;
    }
    return 'Unknown User';
  };

  const getOtherPartyInitial = (conversation) => {
    const name = getOtherPartyName(conversation);
    return name.charAt(0).toUpperCase();
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = (conversation) => {
    if (user?.role?.Student) {
      return Number(conversation.unreadCount?.student || 0);
    } else if (user?.role?.InstitutionAdmin) {
      return Number(conversation.unreadCount?.admin || 0);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="conversation-loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {conversations.length > 0 ? (
        conversations.map((conversation) => {
          const unreadCount = getUnreadCount(conversation);
          return (
            <div
              key={conversation.id}
              className={`conversation-item ${activeConversation === conversation.id ? 'active' : ''}`}
              onClick={() => onConversationSelect(conversation.id)}
            >
              <div className="conversation-avatar">
                {getOtherPartyInitial(conversation)}
              </div>
              
              <div className="conversation-info">
                <div className="conversation-name">
                  {getOtherPartyName(conversation)}
                </div>
                <div className="conversation-last-message">
                  {conversation.lastMessage || 'No messages yet'}
                </div>
                <div className="conversation-timestamp">
                  {formatTimestamp(conversation.lastMessageTimestamp)}
                </div>
              </div>
              
              {unreadCount > 0 && (
                <div className="unread-indicator">
                  {unreadCount}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="no-conversations">
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No conversations yet</h4>
            <p>Your messages will appear here when you start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
