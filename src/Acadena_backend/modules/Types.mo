import Principal "mo:base/Principal";
// import TransferInstitute "TransferInstitute";

module Types {

  // Core ID types
  public type InstitutionId = Text;
  public type StudentId = Text;
  public type DocumentId = Text;
  public type UserId = Text;
  public type TransferId = Text;
  public type TransactionId = Text;
  public type AccessTokenId = Text;

  // User role types
  public type UserRole = {
    #InstitutionAdmin : InstitutionId;
    #Student : StudentId;
    #SystemAdmin;
  };

  public type User = {
    id : UserId;
    principal : Principal;
    role : UserRole;
    email : Text;
    firstName : Text;
    lastName : Text;
    createdDate : Int;
    lastLoginDate : ?Int;
    isActive : Bool;
  };

  public type AuthContext = {
    userId : UserId;
    principal : Principal;
    role : UserRole;
  };

  public type InstitutionType = {
    #University;
    #College;
    #HighSchool;
    #ElementarySchool;
    #TechnicalSchool;
    #Other;
  };

  public type Institution = {
    id : InstitutionId;
    name : Text;
    institutionType : InstitutionType;
    address : Text;
    contactEmail : Text;
    contactPhone : Text;
    registrationDate : Int;
    isActive : Bool;
    accreditationNumber : Text;
    website : ?Text;
    description : ?Text;
    adminUserId : ?UserId; // Link to institution admin user
  };

  // TODO : NEED TO ADD THE INSTITUTION AFFILIATED FIELD
  public type Student = {
    id : StudentId;
    institutionId : InstitutionId;
    firstName : Text;
    lastName : Text;
    email : Text;
    studentNumber : Text;
    program : Text;
    yearLevel : Nat;
    enrollmentDate : Int;
    isActive : Bool;
    userId : ?UserId; // Link to student user account
  };

  public type TransferInstitute = {
    id : TransferId;
    studentId : StudentId;
    fromInstitutionId : InstitutionId;
    toInstitutionId : InstitutionId;
    transferDate : Int;
    status : Text; // "pending", "approved", "rejected"
    notes : ?Text;
    isVerified : Bool; // Whether the transfer has been verified by both institutions
  };

  public type DocumentType = {
    #Transcript;
    #Diploma;
    #Certificate;
    #Recommendation;
    #Other : Text;
  };

  // TODO : ADD A CURRENT OWNER OF THE DOCUMENT
  public type Document = {
    id : DocumentId;
    studentId : StudentId;
    issuingInstitutionId : InstitutionId;
    documentType : DocumentType;
    title : Text;
    content : Text; // Encrypted content or empty for file uploads
    description : ?Text;
    file : ?Blob;
    fileName : ?Text;
    fileType : ?Text;
    issueDate : Int;
    signature : Text;
    isVerified : Bool;
    currentOwner : Principal; // The current owner of the document
    origOwner : Principal;
    status : Text;
  };

  public type TransactionType = {
    #DocumentIssue;
    #DocumentRequest;
    #DocumentTransfer;
    #StudentTransfer;
    #TemporaryAccess;
  };

  public type Transaction = {
    id : Text;
    from : Text; // Institution or Student ID
    to : Text; // Institution or Student ID
    transactionType : TransactionType;
    documentId : ?DocumentId;
    timestamp : Int;
    status : Text;
    notes : ?Text;
  };

  public type DocumentRequest = {
    id : Text;
    requesterId : Text; // Can be student or institution
    targetInstitutionId : InstitutionId;
    studentId : StudentId;
    documentType : DocumentType;
    purpose : Text;
    requestDate : Int;
    status : Text; // "pending", "approved", "rejected"
    expiryDate : ?Int;
  };

  // Invitation code system for student registration
  public type InvitationCode = {
    code : Text;
    studentId : StudentId;
    institutionId : InstitutionId;
    createdBy : UserId; // Institution admin who created it
    createdDate : Int;
    expiryDate : Int;
    isUsed : Bool;
    usedBy : ?Principal; // Principal that claimed the code
    usedDate : ?Int;
  };

  // Error types
  public type Error = {
    #NotFound;
    #AlreadyExists;
    #Unauthorized;
    #InvalidInput;
    #InternalError : Text;
  };

  // System status type
  public type SystemStatus = {
    totalInstitutions : Nat;
    totalStudents : Nat;
    totalDocuments : Nat;
    totalTransactions : Nat;
    totalUsers : Nat;
  };

  public type AccessToken = {
    id : AccessTokenId;
    tokenTitle: Text;
    documentId : DocumentId;
    userId : UserId;
    token : Text;
    createdDate : Int;
    isActive : Bool;
  };

};
