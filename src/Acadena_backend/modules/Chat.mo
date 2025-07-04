import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Types "Types";

module Chat {
  
  public class ChatManager() {
    private var conversations = Map.HashMap<Types.ConversationId, Types.Conversation>(10, Text.equal, Text.hash);
    private var messages = Map.HashMap<Types.MessageId, Types.Message>(100, Text.equal, Text.hash);
    private var _userConversations = Map.HashMap<Types.UserId, [Types.ConversationId]>(10, Text.equal, Text.hash);
    
    // Create or get conversation between student and institution
    public func getOrCreateConversation(
      studentId: Types.StudentId,
      institutionId: Types.InstitutionId,
      institutionAdminId: Types.UserId
    ) : Types.ConversationId {
      let conversationId = studentId # "_" # institutionId;
      
      switch (conversations.get(conversationId)) {
        case (?_existing) { conversationId };
        case null {
          let newConversation: Types.Conversation = {
            id = conversationId;
            studentId = studentId;
            institutionId = institutionId;
            institutionAdminId = institutionAdminId;
            lastMessageTimestamp = Time.now();
            lastMessage = null;
            unreadCount = { student = 0; admin = 0 };
            isActive = true;
            createdDate = Time.now();
          };
          conversations.put(conversationId, newConversation);
          conversationId
        };
      };
    };
    
    // Send message
    public func sendMessage(
      messageId: Types.MessageId,
      conversationId: Types.ConversationId,
      senderId: Types.UserId,
      receiverId: Types.UserId,
      content: Text,
      messageType: Types.MessageType
    ) : Result.Result<Types.Message, Types.Error> {
      
      let message: Types.Message = {
        id = messageId;
        conversationId = conversationId;
        senderId = senderId;
        receiverId = receiverId;
        content = content;
        messageType = messageType;
        timestamp = Time.now();
        isRead = false;
        attachment = null;
      };
      
      messages.put(messageId, message);
      
      // Update conversation or create if it doesn't exist
      switch (conversations.get(conversationId)) {
        case (?conv) {
          let updatedConv = {
            conv with
            lastMessageTimestamp = Time.now();
            lastMessage = ?content;
            // Increment unread count for receiver
          };
          conversations.put(conversationId, updatedConv);
        };
        case null { 
          // Create a new conversation if it doesn't exist
          let newConversation: Types.Conversation = {
            id = conversationId;
            studentId = senderId; // Simplified - you might want better logic here
            institutionId = ""; // Simplified
            institutionAdminId = receiverId; // Simplified
            lastMessageTimestamp = Time.now();
            lastMessage = ?content;
            unreadCount = { student = 0; admin = 1 };
            isActive = true;
            createdDate = Time.now();
          };
          conversations.put(conversationId, newConversation);
        };
      };
      
      #ok(message)
    };
    
    // Get messages for conversation
    public func getConversationMessages(conversationId: Types.ConversationId) : [Types.Message] {
      let allMessages = Iter.toArray(messages.vals());
      Array.filter(allMessages, func(msg: Types.Message) : Bool {
        msg.conversationId == conversationId
      })
    };
    
    // Get user conversations
    public func getUserConversations(userId: Types.UserId) : [Types.Conversation] {
      let allConversations = Iter.toArray(conversations.vals());
      Array.filter(allConversations, func(conv: Types.Conversation) : Bool {
        conv.studentId == userId or conv.institutionAdminId == userId
      })
    };
    
    // Mark messages as read
    public func markMessagesAsRead(conversationId: Types.ConversationId, userId: Types.UserId) : () {
      let conversationMessages = getConversationMessages(conversationId);
      for (message in conversationMessages.vals()) {
        if (message.receiverId == userId and not message.isRead) {
          let updatedMessage = { message with isRead = true };
          messages.put(message.id, updatedMessage);
        };
      };
    };
  }
}