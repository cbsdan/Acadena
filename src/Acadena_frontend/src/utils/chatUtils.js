/**
 * Generate conversation ID using the same logic as the backend
 * The backend uses lexicographic comparison to determine order
 */
export const generateConversationId = (userId, receiverId) => {
  const userIdStr = String(userId);
  const receiverIdStr = String(receiverId);
  
  // Use lexicographic comparison (same as backend)
  if (userIdStr < receiverIdStr) {
    return `${userIdStr}_${receiverIdStr}`;
  } else {
    return `${receiverIdStr}_${userIdStr}`;
  }
};

/**
 * Find existing conversation between two users
 * Uses the exact same ID generation logic as the backend
 */
export const findExistingConversation = (conversations, userId, receiverId) => {
  const expectedConversationId = generateConversationId(userId, receiverId);
  return conversations.find(conv => conv.id === expectedConversationId);
};
