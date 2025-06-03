import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";

// Import our modules
import Types "./modules/Types";
import Users "./modules/Users";
import Institutions "./modules/Institutions";
import Students "./modules/Students";
import Documents "./modules/Documents";
import Invitations "./modules/Invitations";
import Utils "./modules/Utils";

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
  
  // Storage - ID counters
  private stable var nextInstitutionId : Nat = 1;
  private stable var nextStudentId : Nat = 1;
  private stable var nextDocumentId : Nat = 1;
  private stable var nextTransactionId : Nat = 1;
  private stable var nextUserId : Nat = 1;
  private stable var _nextRequestId : Nat = 1;
  
  // Storage - Data maps
  private var institutions = Map.HashMap<InstitutionId, Institution>(10, Text.equal, Text.hash);
  private var students = Map.HashMap<StudentId, Student>(100, Text.equal, Text.hash);
  private var documents = Map.HashMap<DocumentId, Document>(1000, Text.equal, Text.hash);
  private var transactions = Map.HashMap<Text, Transaction>(1000, Text.equal, Text.hash);
  private var users = Map.HashMap<UserId, User>(1000, Text.equal, Text.hash);
  private var principalToUser = Map.HashMap<Principal, UserId>(1000, Principal.equal, Principal.hash);
  private var invitationCodes = Map.HashMap<Text, InvitationCode>(1000, Text.equal, Text.hash);
  
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
  
  // Initialize service instances
  
  // Forward declaration for registerUser function needed by other services
  private func registerUserImpl(
    caller: Principal,
    email: Text,
    firstName: Text,
    lastName: Text,
    role: UserRole
  ) : async Result.Result<User, Error> {
    await userService.registerUser(caller, email, firstName, lastName, role)
  };

  private let userService = Users.UserService(
    users, 
    principalToUser, 
    getNextUserId, 
    incrementUserId
  );

  private let invitationService = Invitations.InvitationService(
    invitationCodes,
    students,
    users,
    principalToUser,
    getNextUserId,
    incrementUserId
  );

  // Create invitation code function for students service
  private func createInvitationCodeImpl(
    studentId: StudentId,
    institutionId: InstitutionId,
    createdBy: UserId
  ) : Result.Result<Text, Error> {
    invitationService.createInvitationCode(studentId, institutionId, createdBy)
  };

  private let institutionService = Institutions.InstitutionService(
    institutions,
    getNextInstitutionId,
    incrementInstitutionId,
    registerUserImpl
  );
  
  private let studentService = Students.StudentService(
    students,
    institutions,
    getNextStudentId,
    incrementStudentId,
    registerUserImpl,
    createInvitationCodeImpl
  );
  
  private let documentService = Documents.DocumentService(
    documents,
    students,
    institutions,
    transactions,
    getNextDocumentId,
    incrementDocumentId,
    getNextTransactionId,
    incrementTransactionId
  );

  private let utilService = Utils.UtilService(
    institutions,
    students,
    documents,
    transactions,
    users
  );
  
  // Helper functions for authentication-aware operations
  private func getUserFromPrincipal(caller: Principal) : ?User {
    switch (principalToUser.get(caller)) {
      case (?userId) { users.get(userId) };
      case null { null };
    }
  };
  
  private func _getStudentByUserId(userId: UserId) : ?Student {
    let studentsArray = Iter.toArray(students.entries());
    for ((_, student) in Iter.fromArray(studentsArray)) {
      switch (student.userId) {
        case (?sUserId) { if (sUserId == userId) { return ?student } };
        case null {};
      };
    };
    null
  };
  
  private func _getUserRole(caller: Principal) : ?UserRole {
    switch (getUserFromPrincipal(caller)) {
      case (?user) { ?user.role };
      case null { null };
    }
  };
  
  // User Management Functions
  public shared(msg) func registerUser(
    email: Text,
    firstName: Text,
    lastName: Text,
    role: UserRole
  ) : async Result.Result<User, Error> {
    await userService.registerUser(msg.caller, email, firstName, lastName, role)
  };
  
  public shared(msg) func getCurrentUserInfo() : async ?User {
    await userService.getCurrentUserInfo(msg.caller)
  };
  
  public shared(msg) func getAllUsers() : async Result.Result<[User], Error> {
    await userService.getAllUsers(msg.caller)
  };

  public shared(msg) func getAllUsersWithoutAdmin() : async Result.Result<[User], Error> {
    await userService.getAllUsersWithoutAdmin(msg.caller)
  };
  
  // Institution Management Functions
  public shared(msg) func registerInstitutionWithAdmin(
    name: Text,
    institutionType: InstitutionType,
    address: Text,
    contactEmail: Text,
    contactPhone: Text,
    accreditationNumber: Text,
    website: ?Text,
    description: ?Text,
    adminFirstName: Text,
    adminLastName: Text,
    adminEmail: Text
  ) : async Result.Result<(Institution, User), Error> {
    await institutionService.registerInstitutionWithAdmin(
      msg.caller, name, institutionType, address, contactEmail, contactPhone,
      accreditationNumber, website, description,
      adminFirstName, adminLastName, adminEmail
    )
  };
  
  public func registerInstitution(
    name: Text,
    institutionType: InstitutionType,
    address: Text,
    contactEmail: Text,
    contactPhone: Text,
    accreditationNumber: Text,
    website: ?Text,
    description: ?Text
  ) : async Result.Result<Institution, Error> {
    await institutionService.registerInstitution(
      name, institutionType, address, contactEmail, contactPhone,
      accreditationNumber, website, description
    )
  };
  
  public query func getInstitution(institutionId: InstitutionId) : async Result.Result<Institution, Error> {
    institutionService.getInstitution(institutionId)
  };
  
  public query func getAllInstitutions() : async [Institution] {
    institutionService.getAllInstitutions()
  };
  
  // Student Management Functions
  public shared(msg) func registerStudentWithUser(
    institutionId: InstitutionId,
    firstName: Text,
    lastName: Text,
    email: Text,
    studentNumber: Text,
    program: Text,
    yearLevel: Nat
  ) : async Result.Result<(Student, User), Error> {
    await studentService.registerStudentWithUser(
      msg.caller, institutionId, firstName, lastName, email, studentNumber, program, yearLevel
    )
  };
  
  public func registerStudent(
    institutionId: InstitutionId,
    firstName: Text,
    lastName: Text,
    email: Text,
    studentNumber: Text,
    program: Text,
    yearLevel: Nat
  ) : async Result.Result<Student, Error> {
    await studentService.registerStudent(
      institutionId, firstName, lastName, email, studentNumber, program, yearLevel
    )
  };
  
  public shared(msg) func createStudentWithInvitationCode(
    institutionId: InstitutionId,
    firstName: Text,
    lastName: Text,
    email: Text,
    studentNumber: Text,
    program: Text,
    yearLevel: Nat
  ) : async Result.Result<(Student, Text), Error> {
    // Get the authenticated user to use as createdBy
    switch (getUserFromPrincipal(msg.caller)) {
      case (?user) {
        switch (user.role) {
          case (#InstitutionAdmin(adminInstitutionId)) {
            // Verify admin can only create students for their institution
            if (adminInstitutionId != institutionId) {
              return #err(#Unauthorized);
            };
            await studentService.createStudentWithInvitationCode(
              institutionId, firstName, lastName, email, studentNumber, program, yearLevel, user.id
            )
          };
          case (#SystemAdmin) {
            // System admin can create students for any institution
            await studentService.createStudentWithInvitationCode(
              institutionId, firstName, lastName, email, studentNumber, program, yearLevel, user.id
            )
          };
          case (_) { #err(#Unauthorized) };
        }
      };
      case null { #err(#Unauthorized) };
    }
  };
  
  public query func getStudent(studentId: StudentId) : async Result.Result<Student, Error> {
    studentService.getStudent(studentId)
  };
  
  public func getStudentsByInstitution(institutionId: InstitutionId) : async Result.Result<[Student], Error> {
    #ok(switch (studentService.getStudentsByInstitution(institutionId)) {
      case (#ok(students)) { students };
      case (#err(error)) { return #err(error) };
    })
  };
  
  public shared(msg) func getMyStudentInfo() : async Result.Result<Student, Error> {
    switch (getUserFromPrincipal(msg.caller)) {
      case (?user) {
        switch (user.role) {
          case (#Student(studentId)) {
            switch (students.get(studentId)) {
              case (?student) { #ok(student) };
              case null { #err(#NotFound) };
            }
          };
          case (_) { #err(#Unauthorized) };
        }
      };
      case null { #err(#Unauthorized) };
    }
  };
  
  // Document Management Functions
  public shared(msg) func issueDocument(
    studentId: StudentId,
    issuingInstitutionId: InstitutionId,
    documentType: DocumentType,
    title: Text,
    content: Text
  ) : async Result.Result<Document, Error> {
    await documentService.issueDocument(msg.caller, studentId, issuingInstitutionId, documentType, title, content)
  };
  
  public query func getDocument(documentId: DocumentId) : async Result.Result<Document, Error> {
    documentService.getDocument(documentId)
  };
  
  public shared(msg) func getMyDocuments() : async Result.Result<[Document], Error> {
    switch (getUserFromPrincipal(msg.caller)) {
      case (?user) {
        switch (user.role) {
          case (#Student(studentId)) {
            // Return documents for this student
            await documentService.getDocumentsByStudent(msg.caller, studentId)
          };
          case (#InstitutionAdmin(institutionId)) {
            // For institution admins, return all documents from their institution
            let documentsArray = Iter.toArray(documents.entries());
            let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
            let institutionDocuments = Array.filter<Document>(allDocuments, func(document) = document.issuingInstitutionId == institutionId);
            #ok(institutionDocuments)
          };
          case (#SystemAdmin) {
            // System admin can see all documents
            let documentsArray = Iter.toArray(documents.entries());
            let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
            #ok(allDocuments)
          };
        }
      };
      case null { #err(#Unauthorized) };
    }
  };
  
  public shared(msg) func getDocumentsByStudent(studentId: StudentId) : async Result.Result<[Document], Error> {
    await documentService.getDocumentsByStudent(msg.caller, studentId)
  };
  
  // Invitation Code Management Functions
  public shared(msg) func claimInvitationCode(code: Text) : async Result.Result<User, Error> {
    await invitationService.claimInvitationCode(msg.caller, code)
  };
  
  public query func getInvitationCodeInfo(code: Text) : async Result.Result<{
    studentName: Text;
    institutionId: InstitutionId;
    isValid: Bool;
    expiryDate: Int;
  }, Error> {
    invitationService.getInvitationCodeInfo(code)
  };
  
  public shared(msg) func getMyInvitationCodes() : async Result.Result<[{
    code: Text;
    studentName: Text;
    studentId: StudentId;
    createdDate: Int;
    expiryDate: Int;
    isUsed: Bool;
    usedDate: ?Int;
  }], Error> {
    switch (getUserFromPrincipal(msg.caller)) {
      case (?user) {
        // Filter invitation codes by the current user
        let invitationsArray = Iter.toArray(invitationCodes.entries());
        let myInvitations = Array.filter<(Text, InvitationCode)>(
          invitationsArray, 
          func((_, invitation)) = invitation.createdBy == user.id
        );
        
        let results = Array.map<(Text, InvitationCode), {
          code: Text;
          studentName: Text;
          studentId: StudentId;
          createdDate: Int;
          expiryDate: Int;
          isUsed: Bool;
          usedDate: ?Int;
        }>(myInvitations, func((code, invitation)) {
          let studentName = switch (students.get(invitation.studentId)) {
            case (?student) { student.firstName # " " # student.lastName };
            case null { "Unknown Student" };
          };
          
          {
            code = code;
            studentName = studentName;
            studentId = invitation.studentId;
            createdDate = invitation.createdDate;
            expiryDate = invitation.expiryDate;
            isUsed = invitation.isUsed;
            usedDate = invitation.usedDate;
          }
        });
        
        #ok(results)
      };
      case null { #err(#Unauthorized) };
    }
  };
  
  // Utility Functions
  public query func greet(name : Text) : async Text {
    utilService.greet(name)
  };
  
  public query func getSystemStatus() : async SystemStatus {
    utilService.getSystemStatus()
  };
}
