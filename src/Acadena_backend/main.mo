import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Array "mo:base/Array";

// Import our modules
import Types "./modules/Types";
import Users "./modules/Users";
import Institutions "./modules/Institutions";
import Students "./modules/Students";
import Documents "./modules/Documents";
import Invitations "./modules/Invitations";
import Utils "./modules/Utils";
import InstitutionsData "./modules/InstitutionsData";

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

  // Storage - ID counters
  private stable var nextInstitutionId : Nat = 1;
  private stable var nextStudentId : Nat = 1;
  private stable var nextDocumentId : Nat = 1;
  private stable var nextTransactionId : Nat = 1;
  private stable var nextUserId : Nat = 1;
  private stable var nextRequestId : Nat = 1;

  // Storage - Data maps
  private var institutions = Map.HashMap<InstitutionId, Institution>(10, Text.equal, Text.hash);
  private var students = Map.HashMap<StudentId, Student>(100, Text.equal, Text.hash);
  private var documents = Map.HashMap<DocumentId, Document>(1000, Text.equal, Text.hash);
  private var transactions = Map.HashMap<Text, Transaction>(1000, Text.equal, Text.hash);
  private var users = Map.HashMap<UserId, User>(1000, Text.equal, Text.hash);
  private var principalToUser = Map.HashMap<Principal, UserId>(1000, Principal.equal, Principal.hash);
  private var invitationCodes = Map.HashMap<Text, InvitationCode>(1000, Text.equal, Text.hash);

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

  // Initialize service instances

  // Forward declaration for registerUser function needed by other services
  private func registerUserImpl(
    email : Text,
    firstName : Text,
    lastName : Text,
    role : UserRole,
  ) : async Result.Result<User, Error> {
    await userService.registerUser(email, firstName, lastName, role);
  };

  private let userService = Users.UserService(
    users,
    principalToUser,
    getNextUserId,
    incrementUserId,
  );

  private let invitationService = Invitations.InvitationService(
    invitationCodes,
    students,
    users,
    principalToUser,
    getNextUserId,
    incrementUserId,
  );
  // Document Chunked Upload Functions
  public func startUpload(
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
  ) : async Result.Result<Document, Error> {
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
    registerUserImpl,
  );

  private let studentService = Students.StudentService(
    students,
    institutions,
    getNextStudentId,
    incrementStudentId,
    registerUserImpl,
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
  public func registerUser(
    email : Text,
    firstName : Text,
    lastName : Text,
    role : UserRole,
  ) : async Result.Result<User, Error> {
    await userService.registerUser(email, firstName, lastName, role);
  };

  public func getCurrentUserInfo() : async ?User {
    await userService.getCurrentUserInfo();
  };

  public func getAllUsers() : async Result.Result<[User], Error> {
    await userService.getAllUsers();
  };

  // Institution Management Functions
  public func registerInstitutionWithAdmin(
    name : Text,
    institutionType : InstitutionType,
    address : Text,
    contactEmail : Text,
    contactPhone : Text,
    accreditationNumber : Text,
    website : ?Text,
    description : ?Text,
    adminFirstName : Text,
    adminLastName : Text,
    adminEmail : Text,
  ) : async Result.Result<(Institution, User), Error> {
    await institutionService.registerInstitutionWithAdmin(
      name,
      institutionType,
      address,
      contactEmail,
      contactPhone,
      accreditationNumber,
      website,
      description,
      adminFirstName,
      adminLastName,
      adminEmail,
    );
  };

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
    institutionId : InstitutionId,
    firstName : Text,
    lastName : Text,
    email : Text,
    studentNumber : Text,
    program : Text,
    yearLevel : Nat,
  ) : async Result.Result<(Student, User), Error> {
    await studentService.registerStudentWithUser(
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

  public query func getDocument(documentId : DocumentId) : async Result.Result<Document, Error> {
    documentService.getDocument(documentId);
  };

  public func getMyDocuments() : async Result.Result<[Document], Error> {
    await documentService.getMyDocuments();
  };

  public func getDocumentsByStudent(studentId : StudentId) : async Result.Result<[Document], Error> {
    await documentService.getDocumentsByStudent(studentId);
  };

  // Invitation Code Management Functions
  public func claimInvitationCode(code : Text) : async Result.Result<User, Error> {
    await invitationService.claimInvitationCode(code);
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
};
