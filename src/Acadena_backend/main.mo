import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
// Import our modules
import Types "./modules/Types";
import Users "./modules/Users";
import Institutions "./modules/Institutions";
import Students "./modules/Students";
import Documents "./modules/Documents";
import Invitations "./modules/Invitations";
import Utils "./modules/Utils";
import InstitutionsData "./modules/InstitutionsData";
import Chat "./modules/Chat";

// import TransacCreator "modules/TransacCreator";

import TransacCreator "modules/TransacCreator";
import TransferModule "./modules/Transfer";

actor Acadena {

  // Import types from modules
  public type InstitutionId = Types.InstitutionId;
  public type StudentId = Types.StudentId;
  public type DocumentId = Types.DocumentId;
  public type UserId = Types.UserId;
  public type UserRole = Types.UserRole;
  public type User = Types.User;
  public type AuthContext = Types.AuthContext;
  public type InstitutionType = Types.InstitutionType;
  public type Institution = Types.Institution;
  public type Student = Types.Student;
  public type DocumentType = Types.DocumentType;
  public type Document = Types.Document;
  public type TransactionType = Types.TransactionType;
  public type Transaction = Types.Transaction;
  public type DocumentRequest = Types.DocumentRequest;
  public type InvitationCode = Types.InvitationCode;
  public type Error = Types.Error;
  public type SystemStatus = Types.SystemStatus;

  // Expose the Institution type from InstitutionsData for CHED institutions
  public type CHEDInstitution = InstitutionsData.Institution;

  // Chat types
  public type MessageId = Types.MessageId;
  public type ConversationId = Types.ConversationId;
  public type MessageType = Types.MessageType;
  public type Message = Types.Message;
  public type Conversation = Types.Conversation;

  // Storage - ID counters
  private stable var nextInstitutionId : Nat = 1;
  private stable var nextStudentId : Nat = 1;
  private stable var nextDocumentId : Nat = 1;
  private stable var nextTransactionId : Nat = 1;
  private stable var nextUserId : Nat = 1;
  private stable var _nextRequestId : Nat = 1;
  private stable var nextTransferId : Nat = 1;

  // Initialize chat manager
  private let chatManager = Chat.ChatManager();
  private stable var nextMessageId : Nat = 1;

  // Storage - Data maps
  private var institutions = Map.HashMap<InstitutionId, Institution>(10, Text.equal, Text.hash);
  private var students = Map.HashMap<StudentId, Student>(100, Text.equal, Text.hash);
  private var documents = Map.HashMap<DocumentId, Document>(1000, Text.equal, Text.hash);
  private var transactions = Map.HashMap<Text, Transaction>(1000, Text.equal, Text.hash);
  private var users = Map.HashMap<UserId, User>(1000, Text.equal, Text.hash);
  private var principalToUser = Map.HashMap<Principal, UserId>(1000, Principal.equal, Principal.hash);
  private var invitationCodes = Map.HashMap<Text, InvitationCode>(1000, Text.equal, Text.hash);
  private var accessTokens = Map.HashMap<Types.AccessTokenId, Types.AccessToken>(1000, Text.equal, Text.hash);
  private var transferRequests = Map.HashMap<Types.TransferId, Types.TransferInstitute>(100, Text.equal, Text.hash);

  // ===== CHED CSV Institutions Storage =====
  stable var chedInstitutions : [CHEDInstitution] = [];

  // ===== CHED CSV Institutions Functions =====
  public shared func addCHEDInstitution(inst : CHEDInstitution) : async () {
    chedInstitutions := Array.append<CHEDInstitution>(chedInstitutions, [inst]);
  };

  public query func getCHEDInstitutions() : async [CHEDInstitution] {
    chedInstitutions;
  };

  // Helper functions for ID management
  private func getNextInstitutionId() : Nat { nextInstitutionId };
  private func incrementInstitutionId() : () { nextInstitutionId += 1 };

  private func getNextStudentId() : Nat { nextStudentId };
  private func incrementStudentId() : () { nextStudentId += 1 };

  private func getNextDocumentId() : Nat { nextDocumentId };
  private func incrementDocumentId() : () { nextDocumentId += 1 };

  private func getNextTransactionId() : Nat { nextTransactionId };
  private func incrementTransactionId() : () { nextTransactionId += 1 };

  private func getNextUserId() : Nat { nextUserId };
  private func incrementUserId() : () { nextUserId += 1 };

  private func getNextTransferId() : Nat { nextTransferId };
  private func incrementTransferId() : () { nextTransferId += 1 };

  // Initialize service instances
     private let transactionService = TransacCreator.TransactionService(
        transactions,
        users,
        principalToUser,
        documents,
        accessTokens, // Pass the accessTokens map
        getNextTransactionId,
        incrementTransactionId
      );
  private let userService = Users.UserService(
    users,
    principalToUser,
    getNextUserId,
    incrementUserId,
  );

  private let transferService = TransferModule.TransferService(
    transferRequests,
    getNextTransferId,
    incrementTransferId
  );

  // Wrapper function for institution service - matches expected signature
  private func registerUserForInstitution(
    caller : Principal,
    email : Text,
    // firstName : Text,
    // lastName : Text,
    role : UserRole,
  ) : async Result.Result<User, Error> {
    await userService.registerUser(caller, email, role);
    // await userService.registerUser(caller, email, firstName, lastName, role);
  };

  // Wrapper function for student service - matches expected signature
  private func registerUserForStudent(
    caller : Principal,
    email : Text,
    // firstName : Text,
    // lastName : Text,
    role : UserRole,
  ) : async Result.Result<User, Error> {
    // await userService.registerUser(caller, email, firstName, lastName, role);
    await userService.registerUser(caller, email, role);
  };

  private let invitationService = Invitations.InvitationService(
    invitationCodes,
    students,
    users,
    principalToUser,
    getNextUserId,
    incrementUserId,
  );
  // Document Chunked Upload Functions
  public shared (msg) func startUpload(
    sessionId : Text,
    studentId : StudentId,
    institutionId : InstitutionId,
    documentType : DocumentType,
    title : Text,
    description : Text,
    fileName : Text,
    fileType : Text,
  ) : async Result.Result<(), Error> {
    await documentService.startUpload(
      msg.caller, // pass the caller principal
      sessionId,
      studentId,
      institutionId,
      documentType,
      title,
      description,
      fileName,
      fileType,
    );
  };

  public func uploadChunk(
    sessionId : Text,
    chunk : [Nat8],
  ) : async Result.Result<(), Error> {
    await documentService.uploadChunk(sessionId, chunk);
  };

  public func finalizeUpload(
    sessionId : Text
  ) : async Result.Result<(Document, Text), Error> {
    await documentService.finalizeUpload(sessionId);
  };
  // Create invitation code function for students service
  private func createInvitationCodeImpl(
    studentId : StudentId,
    institutionId : InstitutionId,
    createdBy : UserId,
  ) : Result.Result<Text, Error> {
    invitationService.createInvitationCode(studentId, institutionId, createdBy);
  };

  private let institutionService = Institutions.InstitutionService(
    institutions,
    getNextInstitutionId,
    incrementInstitutionId,
    registerUserForInstitution,
  );

  private let studentService = Students.StudentService(
    students,
    institutions,
    getNextStudentId,
    incrementStudentId,
    registerUserForStudent,
    createInvitationCodeImpl,
  );

  private let documentService = Documents.DocumentService(
    documents,
    students,
    institutions,
    transactions,
    getNextDocumentId,
    incrementDocumentId,
    getNextTransactionId,
    incrementTransactionId,
  );

  private let utilService = Utils.UtilService(
    institutions,
    students,
    documents,
    transactions,
    users,
  );

  // User Management Functions
  public shared (msg) func registerUser(
    email : Text,
    // firstName : Text,
    // lastName : Text,
    role : UserRole,
  ) : async Result.Result<User, Error> {
    // await userService.registerUser(msg.caller, email, firstName, lastName, role);
    await userService.registerUser(msg.caller, email, role);
  };

  public shared (msg) func getCurrentUserInfo() : async ?User {
    // Pass the actual caller from msg.caller
    await userService.getCurrentUserInfo(msg.caller);
  };

  public shared (_msg) func getAllUsers() : async Result.Result<[User], Error> {
    await userService.getAllUsers();
  };

  // Institution Management Functions
  public shared (msg) func registerInstitutionWithAdmin(
    name : Text,
    institutionType : InstitutionType,
    address : Text,
    contactEmail : Text,
    contactPhone : Text,
    accreditationNumber : Text,
    website : ?Text,
    description : ?Text,
    adminEmail : Text,
  ) : async Result.Result<(Institution, User), Error> {
    await institutionService.registerInstitutionWithAdmin(
      msg.caller,
      name,
      institutionType,
      address,
      contactEmail,
      contactPhone,
      accreditationNumber,
      website,
      description,
      adminEmail,
    );
  };
  // public shared (msg) func registerInstitutionWithAdmin(
  //   name : Text,
  //   institutionType : InstitutionType,
  //   address : Text,
  //   contactEmail : Text,
  //   contactPhone : Text,
  //   accreditationNumber : Text,
  //   website : ?Text,
  //   description : ?Text,
  //   adminFirstName : Text,
  //   adminLastName : Text,
  //   adminEmail : Text,
  // ) : async Result.Result<(Institution, User), Error> {
  //   await institutionService.registerInstitutionWithAdmin(
  //     msg.caller,
  //     name,
  //     institutionType,
  //     address,
  //     contactEmail,
  //     contactPhone,
  //     accreditationNumber,
  //     website,
  //     description,
  //     adminFirstName,
  //     adminLastName,
  //     adminEmail,
  //   );
  // };

  public func registerInstitution(
    name : Text,
    institutionType : InstitutionType,
    address : Text,
    contactEmail : Text,
    contactPhone : Text,
    accreditationNumber : Text,
    website : ?Text,
    description : ?Text,
  ) : async Result.Result<Institution, Error> {
    await institutionService.registerInstitution(
      name,
      institutionType,
      address,
      contactEmail,
      contactPhone,
      accreditationNumber,
      website,
      description,
    );
  };

  public query func getInstitution(institutionId : InstitutionId) : async Result.Result<Institution, Error> {
    institutionService.getInstitution(institutionId);
  };

  public query func getAllInstitutions() : async [Institution] {
    institutionService.getAllInstitutions();
  };

  // Student Management Functions
  public func registerStudentWithUser(
    caller : Principal,
    institutionId : InstitutionId,
    firstName : Text,
    lastName : Text,
    email : Text,
    studentNumber : Text,
    program : Text,
    yearLevel : Nat,
  ) : async Result.Result<(Student, User), Error> {
    await studentService.registerStudentWithUser(
      caller,
      institutionId,
      firstName,
      lastName,
      email,
      studentNumber,
      program,
      yearLevel,
    );
  };

  public func registerStudent(
    institutionId : InstitutionId,
    firstName : Text,
    lastName : Text,
    email : Text,
    studentNumber : Text,
    program : Text,
    yearLevel : Nat,
  ) : async Result.Result<Student, Error> {
    await studentService.registerStudent(
      institutionId,
      firstName,
      lastName,
      email,
      studentNumber,
      program,
      yearLevel,
    );
  };

  public func createStudentWithInvitationCode(
    institutionId : InstitutionId,
    firstName : Text,
    lastName : Text,
    email : Text,
    studentNumber : Text,
    program : Text,
    yearLevel : Nat,
  ) : async Result.Result<(Student, Text), Error> {
    // TODO: Get the actual user ID from authentication
    let createdBy = "USER_1"; // Temporary hardcoded value
    await studentService.createStudentWithInvitationCode(
      institutionId,
      firstName,
      lastName,
      email,
      studentNumber,
      program,
      yearLevel,
      createdBy,
    );
  };

  public query func getStudent(studentId : StudentId) : async Result.Result<Student, Error> {
    studentService.getStudent(studentId);
  };

  public func getStudentsByInstitution(institutionId : InstitutionId) : async Result.Result<[Student], Error> {
    #ok(
      switch (studentService.getStudentsByInstitution(institutionId)) {
        case (#ok(students)) { students };
        case (#err(error)) { return #err(error) };
      }
    );
  };

  public func getMyStudentInfo() : async Result.Result<Student, Error> {
    await studentService.getMyStudentInfo();
  };

  // Document Management Functions
  public func issueDocument(
    studentId : StudentId,
    issuingInstitutionId : InstitutionId,
    documentType : DocumentType,
    title : Text,
    content : Text,
  ) : async Result.Result<Document, Error> {
    await documentService.issueDocument(studentId, issuingInstitutionId, documentType, title, content);
  };

  public func getDocumentsByInstitution(institutionId : InstitutionId) : async Result.Result<[Document], Error> {
    await documentService.getDocumentsByInstitution(institutionId);
  };

  public func getDocumentsWithType(
      filter : Text,
      studentNumber : Text
    ) : async Result.Result<[Document], Error> {
     
      Debug.print("Searching documents with filter: " # filter # " for student: " # studentNumber);
      await transactionService.searchDocumentsByTitle(filter,studentNumber);
    };
    

  public query func getDocument(documentId : DocumentId) : async Result.Result<Document, Error> {
    documentService.getDocument(documentId);
  };

  public func getMyDocuments() : async Result.Result<[Document], Error> {
    await documentService.getMyDocuments();
  };

  public shared ({ caller }) func getDocumentsByStudent(studentId: StudentId) : async Result.Result<[Document], Error> {
    await documentService.getDocumentsByStudentInt(studentId, caller);
  };

  // Query all documents for a student that has access tokens
  public query func getDocumentsByStudentAccessTokens(studentId: StudentId) : async [Document] {
    transactionService.getDocumentsByStudentAccessTokens(studentId)
  };

  // Invitation Code Management Functions
  public shared ({ caller }) func claimInvitationCode(code : Text) : async Result.Result<User, Error> {
    await invitationService.claimInvitationCode(caller, code);
  };

  public query func getInvitationCodeInfo(code : Text) : async Result.Result<{ studentName : Text; institutionId : InstitutionId; isValid : Bool; expiryDate : Int }, Error> {
    invitationService.getInvitationCodeInfo(code);
  };

  public func getMyInvitationCodes() : async Result.Result<[{ code : Text; studentName : Text; studentId : StudentId; createdDate : Int; expiryDate : Int; isUsed : Bool; usedDate : ?Int }], Error> {
    switch (invitationService.getMyInvitationCodes()) {
      case (#ok(codes)) { #ok(codes) };
      case (#err(error)) { #err(error) };
    };
  };

  // Utility Functions
  public query func greet(name : Text) : async Text {
    utilService.greet(name);
  };

  public query func getSystemStatus() : async SystemStatus {
    utilService.getSystemStatus();
  };

  // Access Token Management Function
  public shared func createAccessTokens(
    docIds: [DocumentId],
    studentId: StudentId
  ) : async Result.Result<[Types.AccessToken], Error> {
    // Call the transactionService's createAccessTokensForDocuments
    transactionService.createAccessTokensForDocuments(docIds, studentId)
  };
  
  // Query student info by userId
  public query func getStudentByUserId(userId: UserId) : async ?Student {
    studentService.getStudentByUserId(userId)
  };

  // Transfer Management Functions
  public shared func createTransferRequest(
    studentId : StudentId,
    fromInstitutionId : InstitutionId,
    toInstitutionId : InstitutionId,
    notes : ?Text
  ) : async Types.TransferInstitute {
    transferService.createTransferRequest(studentId, fromInstitutionId, toInstitutionId, notes)
  };

  public query func getTransferRequests() : async [Types.TransferInstitute] {
    transferService.getAllTransferRequests()
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    // Only return students for the currently logged-in institution admin
    let userOpt = principalToUser.get(caller);
    switch (userOpt) {
      case (?userId) {
        let user = users.get(userId);
        switch (user) {
          case (?u) {
            switch (u.role) {
              case (#InstitutionAdmin(institutionId)) {
                let result = studentService.getStudentsByInstitution(institutionId);
                switch (result) {
                  case (#ok(students)) students;
                  case (#err(_)) [];
                }
              };
              case _ [];
            }
          };
          case null [];
        }
      };
      case null [];
    }
  };

  public query ({ caller }) func getTransferRequestsForInstitution() : async [Types.TransferInstitute] {
    transferService.getTransferRequestsForInstitution(caller, principalToUser, users)
  };

  // Create a transfer request (called by sending institution admin)
  public shared ({ caller }) func transferStudentToInstitution(studentId : StudentId, toInstitutionId : InstitutionId) : async Result.Result<Types.TransferInstitute, Text> {
    transferService.transferStudentToInstitution(caller, studentId, toInstitutionId, principalToUser, users)
  };

  // Accept a transfer request (called by receiving institution admin)
  public shared ({ caller }) func acceptTransferRequest(transferId : Types.TransferId) : async Result.Result<Text, Text> {
    transferService.acceptTransferRequest(caller, transferId, principalToUser, users, students, documents, transferRequests)
  };

  // Public functions for chat
  public shared ({ caller }) func sendMessage(content: Text, receiverId: UserId) : async Result.Result<Message, Error> {
    // Get user info from caller
    let userOpt = principalToUser.get(caller);
    switch (userOpt) {
      case (?userId) {
        let userOpt2 = users.get(userId);
        switch (userOpt2) {
          case (?_user) {
            // Determine conversation based on sender/receiver roles
            let messageId = "msg_" # Nat.toText(nextMessageId);
            nextMessageId += 1;
            
            // Create a simple conversation ID based on participants
            let conversationId = if (userId < receiverId) {
              userId # "_" # receiverId
            } else {
              receiverId # "_" # userId
            };
            
            chatManager.sendMessage(messageId, conversationId, userId, receiverId, content, #Text)
          };
          case null { #err(#NotFound) };
        };
      };
      case null { #err(#Unauthorized) };
    };
  };

  public shared ({ caller }) func getMyConversations() : async Result.Result<[Conversation], Error> {
    let userOpt = principalToUser.get(caller);
    switch (userOpt) {
      case (?userId) {
        let conversations = chatManager.getUserConversations(userId);
        #ok(conversations)
      };
      case null { #err(#Unauthorized) };
    };
  };

  public shared ({ caller }) func getConversationMessages(conversationId: ConversationId) : async Result.Result<[Message], Error> {
    let userOpt = principalToUser.get(caller);
    switch (userOpt) {
      case (?_userId) {
        let messages = chatManager.getConversationMessages(conversationId);
        #ok(messages)
      };
      case null { #err(#Unauthorized) };
    };
  };

  // Helper function to get user info for conversations
  public shared ({ caller = _ }) func getUserForConversation(userId: UserId) : async ?{
    id: UserId;
    name: Text;
    role: UserRole;
  } {
    // First try to get from users
    switch (users.get(userId)) {
      case (?user) {
        // Get display name based on role
        let displayName = switch (user.role) {
          case (#Student(studentId)) {
            switch (students.get(studentId)) {
              case (?student) { student.firstName # " " # student.lastName };
              case null { "Student" };
            };
          };
          case (#InstitutionAdmin(instId)) {
            switch (institutions.get(instId)) {
              case (?institution) { institution.name # " Admin" };
              case null { "Admin" };
            };
          };
          case (#SystemAdmin) { "System Admin" };
        };
        
        ?{
          id = user.id;
          name = displayName;
          role = user.role;
        }
      };
      case null { null };
    };
  };

  // Get available chat recipients
  public shared ({ caller }) func getAvailableChatRecipients() : async Result.Result<[{
    id: UserId;
    name: Text;
    role: Text;
  }], Error> {
    let userOpt = principalToUser.get(caller);
    switch (userOpt) {
      case (?userId) {
        let userOpt2 = users.get(userId);
        switch (userOpt2) {
          case (?currentUser) {
            var recipients: [{id: UserId; name: Text; role: Text}] = [];
            
            Debug.print("Getting chat recipients for user: " # userId);
            Debug.print("User role: " # debug_show(currentUser.role));
            
            switch (currentUser.role) {
              case (#Student(_studentId)) {
                // Students can chat with institution admins
                Debug.print("User is a student, finding institution admins...");
                let allUsers = Iter.toArray(users.vals());
                Debug.print("Total users in system: " # Nat.toText(allUsers.size()));
                
                for (user in allUsers.vals()) {
                  switch (user.role) {
                    case (#InstitutionAdmin(instId)) {
                      switch (institutions.get(instId)) {
                        case (?institution) {
                          Debug.print("Found institution admin: " # user.id # " for institution: " # institution.name);
                          recipients := Array.append(recipients, [{
                            id = user.id;
                            name = institution.name # " Admin";
                            role = "admin";
                          }]);
                        };
                        case null {
                          Debug.print("Institution not found for admin: " # user.id);
                        };
                      };
                    };
                    case _ {};
                  };
                };
              };
              case (#InstitutionAdmin(institutionId)) {
                // Institution admins can chat with their students
                Debug.print("User is an institution admin for: " # institutionId);
                let institutionStudents = switch (studentService.getStudentsByInstitution(institutionId)) {
                  case (#ok(students)) { 
                    Debug.print("Found " # Nat.toText(students.size()) # " students in institution");
                    students 
                  };
                  case (#err(error)) { 
                    Debug.print("Error getting students: " # debug_show(error));
                    [] 
                  };
                };
                
                for (student in institutionStudents.vals()) {
                  Debug.print("Processing student: " # student.firstName # " " # student.lastName);
                  Debug.print("Student userId: " # debug_show(student.userId));
                  // Only add students that have a userId
                  switch (student.userId) {
                    case (?studentUserId) {
                      Debug.print("Adding student to recipients: " # studentUserId);
                      recipients := Array.append(recipients, [{
                        id = studentUserId;
                        name = student.firstName # " " # student.lastName # " (" # student.studentNumber # ")";
                        role = "student";
                      }]);
                    };
                    case null {
                      Debug.print("Student has no userId, skipping: " # student.firstName # " " # student.lastName);
                    };
                  };
                };
              };
              case _ {
                Debug.print("User role not supported for chat");
              };
            };
            
            Debug.print("Total recipients found: " # Nat.toText(recipients.size()));
            #ok(recipients)
          };
          case null { 
            Debug.print("User not found: " # userId);
            #err(#NotFound) 
          };
        };
      };
      case null { 
        Debug.print("Principal not mapped to user");
        #err(#Unauthorized) 
      };
    };
  };

  // Debug function to check students and their userIds
  public query func debugStudentsWithUserIds() : async [{
    studentId: StudentId;
    firstName: Text;
    lastName: Text;
    hasUserId: Bool;
    userId: ?UserId;
  }] {
    let allStudents = Iter.toArray(students.vals());
    Array.map<Student, {studentId: StudentId; firstName: Text; lastName: Text; hasUserId: Bool; userId: ?UserId}>(
      allStudents,
      func(student) {
        {
          studentId = student.id;
          firstName = student.firstName;
          lastName = student.lastName;
          hasUserId = switch (student.userId) { case (?_) true; case null false };
          userId = student.userId;
        }
      }
    )
  };

  // Debug function to check all users and their roles
  public query func debugAllUsers() : async [{
    userId: UserId;
    email: Text;
    role: Text;
  }] {
    let allUsers = Iter.toArray(users.vals());
    Array.map<User, {userId: UserId; email: Text; role: Text}>(
      allUsers,
      func(user) {
        let roleText = switch (user.role) {
          case (#Student(id)) "Student(" # id # ")";
          case (#InstitutionAdmin(id)) "InstitutionAdmin(" # id # ")";
          case (#SystemAdmin) "SystemAdmin";
        };
        {
          userId = user.id;
          email = user.email;
          role = roleText;
        }
      }
    )
  };
};
