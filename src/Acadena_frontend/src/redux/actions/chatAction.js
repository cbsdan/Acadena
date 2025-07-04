import { createAsyncThunk } from '@reduxjs/toolkit';
import { internetIdentityService } from '../../services/InternetIdentityService';

// Helper function to get authenticated backend actor
const getBackendActor = async () => {
  await internetIdentityService.init();
  return internetIdentityService.getActor();
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const backendActor = await getBackendActor();
      const result = await backendActor.getMyConversations();
      if (result.ok) {
        return result.ok;
      } else {
        return rejectWithValue(result.err);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const backendActor = await getBackendActor();
      const result = await backendActor.getConversationMessages(conversationId);
      if (result.ok) {
        return { conversationId, messages: result.ok };
      } else {
        return rejectWithValue(result.err);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ content, receiverId }, { rejectWithValue }) => {
    try {
      const backendActor = await getBackendActor();
      const result = await backendActor.sendMessage(content, receiverId);
      if (result.ok) {
        // Generate conversation ID for frontend state management (same logic as backend)
        // We don't have access to the actual user ID here, so we'll let the reducer handle it
        return { message: result.ok };
      } else {
        return rejectWithValue(result.err);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChatRecipients = createAsyncThunk(
  'chat/fetchChatRecipients',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Calling backend getAvailableChatRecipients...');
      const backendActor = await getBackendActor();
      const result = await backendActor.getAvailableChatRecipients();
      console.log('Backend result:', result);
      
      if (result.ok) {
        console.log('Recipients found:', result.ok);
        return result.ok;
      } else {
        console.error('Backend error:', result.err);
        return rejectWithValue(result.err);
      }
    } catch (error) {
      console.error('fetchChatRecipients error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Debug actions
export const debugStudentsWithUserIds = createAsyncThunk(
  'chat/debugStudentsWithUserIds',
  async (_, { rejectWithValue }) => {
    try {
      const backendActor = await getBackendActor();
      const result = await backendActor.debugStudentsWithUserIds();
      console.log('Students with userIds:', result);
      return result;
    } catch (error) {
      console.error('debugStudentsWithUserIds error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const debugAllUsers = createAsyncThunk(
  'chat/debugAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const backendActor = await getBackendActor();
      const result = await backendActor.debugAllUsers();
      console.log('All users:', result);
      return result;
    } catch (error) {
      console.error('debugAllUsers error:', error);
      return rejectWithValue(error.message);
    }
  }
);
