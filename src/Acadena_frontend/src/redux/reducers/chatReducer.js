import { createSlice } from '@reduxjs/toolkit';
import { fetchConversations, fetchConversationsBackground, fetchMessages, sendMessage, fetchChatRecipients } from '../actions/chatAction';

const initialState = {
  conversations: [],
  messages: {}, // { conversationId: [messages] }
  activeConversation: null,
  recipients: [], // Available people to chat with
  loading: false, // For initial loads only
  error: null,
  unreadCount: 0,
  isInitialLoad: true, // Track if this is the first load
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearMessages: (state) => {
      state.messages = {};
      state.activeConversation = null;
    },
    markAsRead: (state, action) => {
      const { conversationId } = action.payload;
      if (state.messages[conversationId]) {
        state.messages[conversationId] = state.messages[conversationId].map(msg => ({
          ...msg,
          isRead: true
        }));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        // Only show loading for initial load
        if (state.isInitialLoad) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
        state.loading = false;
        state.isInitialLoad = false; // After first successful load
        // Calculate total unread count - convert BigInt values to numbers
        state.unreadCount = action.payload.reduce((total, conv) => 
          total + Number(conv.unreadCount?.student || 0) + Number(conv.unreadCount?.admin || 0), 0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.messages[conversationId] = messages;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { message } = action.payload;
        const conversationId = message.conversationId;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch chat recipients
      .addCase(fetchChatRecipients.pending, (state) => {
        console.log('fetchChatRecipients pending...');
        state.loading = true;
      })
      .addCase(fetchChatRecipients.fulfilled, (state, action) => {
        console.log('fetchChatRecipients fulfilled with:', action.payload);
        state.recipients = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRecipients.rejected, (state, action) => {
        console.log('fetchChatRecipients rejected with:', action.payload);
        state.loading = false;
        state.error = action.payload;
      })
      // Background fetch conversations (for real-time updates - silent, no loading indicators)
      .addCase(fetchConversationsBackground.pending, (state) => {
        // No loading indicators for background updates
      })
      .addCase(fetchConversationsBackground.fulfilled, (state, action) => {
        state.conversations = action.payload;
        // Calculate total unread count - convert BigInt values to numbers
        state.unreadCount = action.payload.reduce((total, conv) => 
          total + Number(conv.unreadCount?.student || 0) + Number(conv.unreadCount?.admin || 0), 0
        );
      })
      .addCase(fetchConversationsBackground.rejected, (state, action) => {
        // Silent failure for background updates - don't disrupt UI
      });
  },
});

export const { setActiveConversation, clearMessages, markAsRead } = chatSlice.actions;
export default chatSlice.reducer;
