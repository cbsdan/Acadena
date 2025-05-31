import Map "mo:base/HashMap";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Char "mo:base/Char";

actor Acadena {
  
  // Core ID types
  public type InstitutionId = Text;
  public type StudentId = Text;
  public type DocumentId = Text;
  public type UserId = Text;
  
  // User role types
  public type UserRole = {
    #InstitutionAdmin: InstitutionId;
    #Student: StudentId;
    #SystemAdmin;
  };
  
  public type User = {
    id: UserId;
    principal: Principal;
    role: UserRole;
    email: Text;
    firstName: Text;
    lastName: Text;
    createdDate: Int;
    lastLoginDate: ?Int;
    isActive: Bool;
  };
  
  public type AuthContext = {
    userId: UserId;
    principal: Principal;
    role: UserRole;
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
    id: InstitutionId;
    name: Text;
    institutionType: InstitutionType;
    address: Text;
    contactEmail: Text;
    contactPhone: Text;
    registrationDate: Int;
    isActive: Bool;
    accreditationNumber: Text;
    website: ?Text;
    description: ?Text;
    adminUserId: ?UserId; // Link to institution admin user
  };
  
  public type Student = {
    id: StudentId;
    institutionId: InstitutionId;
    firstName: Text;
    lastName: Text;
    email: Text;
    studentNumber: Text;
    program: Text;
    yearLevel: Nat;
    enrollmentDate: Int;
    isActive: Bool;
    userId: ?UserId; // Link to student user account
  };
  
  public type DocumentType = {
    #Transcript;
    #Diploma;
    #Certificate;
    #Recommendation;
    #Other: Text;
  };
  
  public type Document = {
    id: DocumentId;
    studentId: StudentId;
    issuingInstitutionId: InstitutionId;
    documentType: DocumentType;
    title: Text;
    content: Text; // Encrypted content
    issueDate: Int;
    signature: Text; // Digital signature
    isVerified: Bool;
  };
  
  public type TransactionType = {
    #DocumentIssue;
    #DocumentRequest;
    #DocumentTransfer;
    #StudentTransfer;
    #TemporaryAccess;
  };
  
  public type Transaction = {
    id: Text;
    from: Text; // Institution or Student ID
    to: Text; // Institution or Student ID
    transactionType: TransactionType;
    documentId: ?DocumentId;
    timestamp: Int;
    status: Text;
    notes: ?Text;
  };
  
  public type DocumentRequest = {
    id: Text;
    requesterId: Text; // Can be student or institution
    targetInstitutionId: InstitutionId;
    studentId: StudentId;
    documentType: DocumentType;
    purpose: Text;
    requestDate: Int;
    status: Text; // "pending", "approved", "rejected"
    expiryDate: ?Int;
  };
  
  // Invitation code system for student registration
  public type InvitationCode = {
    code: Text;
    studentId: StudentId;
    institutionId: InstitutionId;
    createdBy: UserId; // Institution admin who created it
    createdDate: Int;
    expiryDate: Int;
    isUsed: Bool;
    usedBy: ?Principal; // Principal that claimed the code
    usedDate: ?Int;
  };
  
  // Error types
  public type Error = {
    #NotFound;
    #AlreadyExists;
    #Unauthorized;
    #InvalidInput;
    #InternalError: Text;
  };
  
  // Storage
  private stable var nextInstitutionId : Nat = 1;
  private stable var nextStudentId : Nat = 1;
  private stable var nextDocumentId : Nat = 1;
  private stable var nextTransactionId : Nat = 1;
  private stable var nextRequestId : Nat = 1;
  private stable var nextUserId : Nat = 1;
  
  private var institutions = Map.HashMap<InstitutionId, Institution>(10, Text.equal, Text.hash);
  private var students = Map.HashMap<StudentId, Student>(100, Text.equal, Text.hash);
  private var documents = Map.HashMap<DocumentId, Document>(1000, Text.equal, Text.hash);
  private var transactions = Map.HashMap<Text, Transaction>(1000, Text.equal, Text.hash);
  private var documentRequests = Map.HashMap<Text, DocumentRequest>(100, Text.equal, Text.hash);
  private var users = Map.HashMap<UserId, User>(1000, Text.equal, Text.hash);
  private var principalToUser = Map.HashMap<Principal, UserId>(1000, Principal.equal, Principal.hash);
  private var invitationCodes = Map.HashMap<Text, InvitationCode>(1000, Text.equal, Text.hash);
  
  // Authentication and Authorization Functions
  
  private func getCurrentUser(caller: Principal) : ?AuthContext {
    switch (principalToUser.get(caller)) {
      case (?userId) {
        switch (users.get(userId)) {
          case (?user) {
            // Update last login
            let updatedUser = {
              user with
              lastLoginDate = ?Time.now();
            };
            users.put(userId, updatedUser);
            
            ?{
              userId = userId;
              principal = caller;
              role = user.role;
            }
          };
          case null { null };
        }
      };
      case null { null };
    }
  };
  
  private func requireAuth(caller: Principal) : Result.Result<AuthContext, Error> {
    switch (getCurrentUser(caller)) {
      case (?auth) { #ok(auth) };
      case null { #err(#Unauthorized) };
    }
  };
  
  private func requireRole(requiredRole: UserRole, auth: AuthContext) : Bool {
    switch (requiredRole, auth.role) {
      case (#SystemAdmin, #SystemAdmin) { true };
      case (#InstitutionAdmin(reqInst), #InstitutionAdmin(userInst)) { reqInst == userInst };
      case (#Student(reqStudent), #Student(userStudent)) { reqStudent == userStudent };
      case (#SystemAdmin, _) { true }; // System admin can access everything
      case (_, _) { false };
    }
  };
  
  // Invitation Code Helper Functions
  
  private func generateInvitationCode() : Text {
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charsArray = Text.toIter(chars);
    let charsArr = Iter.toArray(charsArray);
    
    var code = "";
    let time = Time.now();
    let timeNat = Int.abs(time) % 1000000;
    
    // Generate a 8-character code
    for (i in Iter.range(0, 7)) {
      let index = (timeNat + i) % charsArr.size();
      let char = charsArr[index];
      code := code # Char.toText(char);
    };
    
    code
  };
  
  private func isInvitationCodeExpired(invitationCode: InvitationCode) : Bool {
    Time.now() > invitationCode.expiryDate
  };
  
  private func isInvitationCodeValid(invitationCode: InvitationCode) : Bool {
    not invitationCode.isUsed and not isInvitationCodeExpired(invitationCode)
  };

  // User Management Functions
  
  public func registerUser(
    email: Text,
    firstName: Text,
    lastName: Text,
    role: UserRole
  ) : async Result.Result<User, Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, use a temporary principal to bypass authentication
    let caller = Principal.fromText("2vxsx-fae");
    
    // Check if user already exists
    switch (principalToUser.get(caller)) {
      case (?_) { return #err(#AlreadyExists) };
      case null { };
    };
    
    // Validate input
    if (Text.size(email) == 0 or Text.size(firstName) == 0 or Text.size(lastName) == 0) {
      return #err(#InvalidInput);
    };
    
    let userId = "USER_" # Nat.toText(nextUserId);
    nextUserId += 1;
    
    let user: User = {
      id = userId;
      principal = caller;
      role = role;
      email = email;
      firstName = firstName;
      lastName = lastName;
      createdDate = Time.now();
      lastLoginDate = null;
      isActive = true;
    };
    
    users.put(userId, user);
    principalToUser.put(caller, userId);
    
    #ok(user)
  };
  
  public func getCurrentUserInfo() : async ?User {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, use a temporary principal to bypass authentication
    let caller = Principal.fromText("2vxsx-fae");
    switch (principalToUser.get(caller)) {
      case (?userId) { users.get(userId) };
      case null { null };
    }
  };
  
  // Institution Management Functions
  
  public func registerInstitutionWithAdmin(
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
    
    // Validate input
    if (Text.size(name) == 0 or Text.size(contactEmail) == 0 or Text.size(accreditationNumber) == 0) {
      return #err(#InvalidInput);
    };
    
    if (Text.size(adminFirstName) == 0 or Text.size(adminLastName) == 0 or Text.size(adminEmail) == 0) {
      return #err(#InvalidInput);
    };
    
    // Check if institution with same accreditation number already exists
    for ((id, inst) in institutions.entries()) {
      if (inst.accreditationNumber == accreditationNumber) {
        return #err(#AlreadyExists);
      };
    };
    
    let institutionId = "INST_" # Nat.toText(nextInstitutionId);
    nextInstitutionId += 1;
    
    // Create institution admin user
    let adminRole = #InstitutionAdmin(institutionId);
    let adminUserResult = await registerUser(adminEmail, adminFirstName, adminLastName, adminRole);
    
    let adminUser = switch (adminUserResult) {
      case (#ok(user)) { user };
      case (#err(error)) { return #err(error) };
    };
    
    let institution: Institution = {
      id = institutionId;
      name = name;
      institutionType = institutionType;
      address = address;
      contactEmail = contactEmail;
      contactPhone = contactPhone;
      registrationDate = Time.now();
      isActive = true;
      accreditationNumber = accreditationNumber;
      website = website;
      description = description;
      adminUserId = ?adminUser.id;
    };
    
    institutions.put(institutionId, institution);
    
    #ok((institution, adminUser))
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
    
    // Validate input
    if (Text.size(name) == 0 or Text.size(contactEmail) == 0 or Text.size(accreditationNumber) == 0) {
      return #err(#InvalidInput);
    };
    
    // Check if institution with same accreditation number already exists
    for ((id, inst) in institutions.entries()) {
      if (inst.accreditationNumber == accreditationNumber) {
        return #err(#AlreadyExists);
      };
    };
    
    let institutionId = "INST_" # Nat.toText(nextInstitutionId);
    nextInstitutionId += 1;
    
    let newInstitution : Institution = {
      id = institutionId;
      name = name;
      institutionType = institutionType;
      address = address;
      contactEmail = contactEmail;
      contactPhone = contactPhone;
      registrationDate = Time.now();
      isActive = true;
      accreditationNumber = accreditationNumber;
      website = website;
      description = description;
      adminUserId = null;
    };
    
    institutions.put(institutionId, newInstitution);
    
    #ok(newInstitution)
  };
  
  public query func getInstitution(institutionId: InstitutionId) : async Result.Result<Institution, Error> {
    switch (institutions.get(institutionId)) {
      case (?institution) { #ok(institution) };
      case null { #err(#NotFound) };
    }
  };
  
  public query func getAllInstitutions() : async [Institution] {
    let institutionsArray = Iter.toArray(institutions.entries());
    Array.map<(InstitutionId, Institution), Institution>(institutionsArray, func((_, inst)) = inst)
  };
  
  // Student Management Functions with Authorization
  
  public func registerStudentWithUser(
    institutionId: InstitutionId,
    firstName: Text,
    lastName: Text,
    email: Text,
    studentNumber: Text,
    program: Text,
    yearLevel: Nat
  ) : async Result.Result<(Student, User), Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication and authorization
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // Skip authorization check for now
    // Only institution admins can register students for their institution
    // switch (auth.role) {
    //   case (#InstitutionAdmin(adminInst)) {
    //     if (adminInst != institutionId) {
    //       return #err(#Unauthorized);
    //     };
    //   };
    //   case (#SystemAdmin) { }; // System admin can register for any institution
    //   case (_) { return #err(#Unauthorized) };
    // };
    
    // Validate institution exists
    switch (institutions.get(institutionId)) {
      case null { return #err(#NotFound) };
      case (?_) {};
    };
    
    // Validate input
    if (Text.size(firstName) == 0 or Text.size(lastName) == 0 or Text.size(email) == 0) {
      return #err(#InvalidInput);
    };
    
    let studentId = "STU_" # Nat.toText(nextStudentId);
    nextStudentId += 1;
    
    // Create student user account
    let studentRole = #Student(studentId);
    let studentUserResult = await registerUser(email, firstName, lastName, studentRole);
    
    let studentUser = switch (studentUserResult) {
      case (#ok(user)) { user };
      case (#err(error)) { return #err(error) };
    };
    
    let newStudent : Student = {
      id = studentId;
      institutionId = institutionId;
      firstName = firstName;
      lastName = lastName;
      email = email;
      studentNumber = studentNumber;
      program = program;
      yearLevel = yearLevel;
      enrollmentDate = Time.now();
      isActive = true;
      userId = ?studentUser.id;
    };
    
    students.put(studentId, newStudent);
    
    #ok((newStudent, studentUser))
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
    
    // Validate institution exists
    switch (institutions.get(institutionId)) {
      case null { return #err(#NotFound) };
      case (?_) {};
    };
    
    // Validate input
    if (Text.size(firstName) == 0 or Text.size(lastName) == 0 or Text.size(email) == 0) {
      return #err(#InvalidInput);
    };
    
    let studentId = "STU_" # Nat.toText(nextStudentId);
    nextStudentId += 1;
    
    let newStudent : Student = {
      id = studentId;
      institutionId = institutionId;
      firstName = firstName;
      lastName = lastName;
      email = email;
      studentNumber = studentNumber;
      program = program;
      yearLevel = yearLevel;
      enrollmentDate = Time.now();
      isActive = true;
      userId = null;
    };
    
    students.put(studentId, newStudent);
    #ok(newStudent)
  };
  
  public query func getStudent(studentId: StudentId) : async Result.Result<Student, Error> {
    switch (students.get(studentId)) {
      case (?student) { #ok(student) };
      case null { #err(#NotFound) };
    }
  };
  
  public func getStudentsByInstitution(institutionId: InstitutionId) : async Result.Result<[Student], Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication and authorization
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // Skip authorization check for now
    // Only institution admins can view students from their institution
    // switch (auth.role) {
    //   case (#InstitutionAdmin(adminInst)) {
    //     if (adminInst != institutionId) {
    //       return #err(#Unauthorized);
    //     };
    //   };
    //   case (#SystemAdmin) { }; // System admin can view all
    //   case (_) { return #err(#Unauthorized) };
    // };
    
    let studentsArray = Iter.toArray(students.entries());
    let allStudents = Array.map<(StudentId, Student), Student>(studentsArray, func((_, stu)) = stu);
    let filteredStudents = Array.filter<Student>(allStudents, func(student) = student.institutionId == institutionId);
    
    #ok(filteredStudents)
  };
  
  public func getMyStudentInfo() : async Result.Result<Student, Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // For now, return a default error since we can't identify the student
    #err(#Unauthorized)
  };
  
  // Document Management Functions with Authorization
  
  public func issueDocument(
    studentId: StudentId,
    issuingInstitutionId: InstitutionId,
    documentType: DocumentType,
    title: Text,
    content: Text
  ) : async Result.Result<Document, Error> {
    
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication and authorization
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // Skip authorization check for now
    // Only institution admins can issue documents for their institution
    // switch (auth.role) {
    //   case (#InstitutionAdmin(adminInst)) {
    //     if (adminInst != issuingInstitutionId) {
    //       return #err(#Unauthorized);
    //     };
    //   };
    //   case (#SystemAdmin) { }; // System admin can issue for any institution
    //   case (_) { return #err(#Unauthorized) };
    // };
    
    // Validate student and institution exist
    switch (students.get(studentId), institutions.get(issuingInstitutionId)) {
      case (?_, ?_) {};
      case (_, _) { return #err(#NotFound) };
    };
    
    let documentId = "DOC_" # Nat.toText(nextDocumentId);
    nextDocumentId += 1;
    
    let timeNow = Int.abs(Time.now());
    
    // Generate digital signature (simplified)
    let signature = "SIG_" # documentId # "_" # Nat.toText(timeNow);
    
    let newDocument : Document = {
      id = documentId;
      studentId = studentId;
      issuingInstitutionId = issuingInstitutionId;
      documentType = documentType;
      title = title;
      content = content; // In production, this would be encrypted
      issueDate = Time.now();
      signature = signature;
      isVerified = true;
    };
    
    documents.put(documentId, newDocument);
    
    // Record transaction
    let transactionId = "TXN_" # Nat.toText(nextTransactionId);
    nextTransactionId += 1;
    
    let transaction : Transaction = {
      id = transactionId;
      from = issuingInstitutionId;
      to = studentId;
      transactionType = #DocumentIssue;
      documentId = ?documentId;
      timestamp = Time.now();
      status = "completed";
      notes = ?("Document issued: " # title);
    };
    
    transactions.put(transactionId, transaction);
    
    #ok(newDocument)
  };
  
  public query func getDocument(documentId: DocumentId) : async Result.Result<Document, Error> {
    switch (documents.get(documentId)) {
      case (?document) { #ok(document) };
      case null { #err(#NotFound) };
    }
  };
  
  public func getMyDocuments() : async Result.Result<[Document], Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // For now, return empty array since we can't identify the user
    #ok([])
  };
  
  public func getDocumentsByStudent(studentId: StudentId) : async Result.Result<[Document], Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication and authorization
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // Skip authorization check for now
    let authorized = true;
    
    if (not authorized) {
      return #err(#Unauthorized);
    };
    
    let documentsArray = Iter.toArray(documents.entries());
    let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
    let studentDocuments = Array.filter<Document>(allDocuments, func(document) = document.studentId == studentId);
    
    #ok(studentDocuments)
  };
  
  // Invitation Code Management Functions
  
  public func createStudentWithInvitationCode(
    institutionId: InstitutionId,
    firstName: Text,
    lastName: Text,
    email: Text,
    studentNumber: Text,
    program: Text,
    yearLevel: Nat
  ) : async Result.Result<(Student, Text), Error> {
    
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing of invitation code workflow
    
    // Validate institution exists
    switch (institutions.get(institutionId)) {
      case null { return #err(#NotFound) };
      case (?_) {};
    };
    
    // Validate input
    if (Text.size(firstName) == 0 or Text.size(lastName) == 0 or Text.size(email) == 0) {
      return #err(#InvalidInput);
    };
    
    let studentId = "STU_" # Nat.toText(nextStudentId);
    nextStudentId += 1;
    
    // Create student record (without user account)
    let newStudent : Student = {
      id = studentId;
      institutionId = institutionId;
      firstName = firstName;
      lastName = lastName;
      email = email;
      studentNumber = studentNumber;
      program = program;
      yearLevel = yearLevel;
      enrollmentDate = Time.now();
      isActive = true;
      userId = null; // Will be set when invitation is claimed
    };
    
    students.put(studentId, newStudent);
    
    // Generate invitation code
    var invitationCode = generateInvitationCode();
    // Ensure code is unique
    while (invitationCodes.get(invitationCode) != null) {
      invitationCode := generateInvitationCode();
    };
    
    let invitation : InvitationCode = {
      code = invitationCode;
      studentId = studentId;
      institutionId = institutionId;
      createdBy = "TEMP_USER"; // TODO: Use actual auth.userId when auth is fixed
      createdDate = Time.now();
      expiryDate = Time.now() + (30 * 24 * 60 * 60 * 1_000_000_000); // 30 days in nanoseconds
      isUsed = false;
      usedBy = null;
      usedDate = null;
    };
    
    invitationCodes.put(invitationCode, invitation);
    
    #ok((newStudent, invitationCode))
  };
  
  public func claimInvitationCode(code: Text) : async Result.Result<User, Error> {
    
    // TODO: Implement proper authentication when msg.caller is available
    // For now, we'll create a user account without checking if one already exists
    
    // Get invitation code
    switch (invitationCodes.get(code)) {
      case null { return #err(#NotFound) };
      case (?invitation) {
        // Validate invitation code
        if (not isInvitationCodeValid(invitation)) {
          return #err(#InvalidInput);
        };
        
        // Get student record
        switch (students.get(invitation.studentId)) {
          case null { return #err(#NotFound) };
          case (?student) {
            // Create user account for student
            let userId = "USER_" # Nat.toText(nextUserId);
            nextUserId += 1;
            
            let studentRole = #Student(invitation.studentId);
            // Use a temporary principal since msg.caller is not available
            let tempPrincipal = Principal.fromText("2vxsx-fae");
            
            let user: User = {
              id = userId;
              principal = tempPrincipal;
              role = studentRole;
              email = student.email;
              firstName = student.firstName;
              lastName = student.lastName;
              createdDate = Time.now();
              lastLoginDate = null;
              isActive = true;
            };
            
            users.put(userId, user);
            principalToUser.put(tempPrincipal, userId);
            
            // Update student record with user ID
            let updatedStudent = {
              student with
              userId = ?userId;
            };
            students.put(invitation.studentId, updatedStudent);
            
            // Mark invitation as used
            let usedInvitation = {
              invitation with
              isUsed = true;
              usedBy = ?tempPrincipal;
              usedDate = ?Time.now();
            };
            invitationCodes.put(code, usedInvitation);
            
            #ok(user)
          };
        };
      };
    }
  };
  
  public query func getInvitationCodeInfo(code: Text) : async Result.Result<{
    studentName: Text;
    institutionId: InstitutionId;
    isValid: Bool;
    expiryDate: Int;
  }, Error> {
    switch (invitationCodes.get(code)) {
      case null { #err(#NotFound) };
      case (?invitation) {
        switch (students.get(invitation.studentId)) {
          case null { #err(#NotFound) };
          case (?student) {
            #ok({
              studentName = student.firstName # " " # student.lastName;
              institutionId = invitation.institutionId;
              isValid = isInvitationCodeValid(invitation);
              expiryDate = invitation.expiryDate;
            })
          };
        };
      };
    }
  };
  
  public func getMyInvitationCodes() : async Result.Result<[{
    code: Text;
    studentName: Text;
    studentId: StudentId;
    createdDate: Int;
    expiryDate: Int;
    isUsed: Bool;
    usedDate: ?Int;
  }], Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // For now, return all invitation codes since we can't identify the user
    let invitationsArray = Iter.toArray(invitationCodes.entries());
    // Skip filtering by user for now
    // let myInvitations = Array.filter<(Text, InvitationCode)>(
    //   invitationsArray, 
    //   func((_, invitation)) = invitation.createdBy == auth.userId
    // );
    
    let results = Array.map<(Text, InvitationCode), {
      code: Text;
      studentName: Text;
      studentId: StudentId;
      createdDate: Int;
      expiryDate: Int;
      isUsed: Bool;
      usedDate: ?Int;
    }>(invitationsArray, func((code, invitation)) {
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

  // Utility Functions
  
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "! Welcome to Acadena - Academic Records Management System";
  };
  
  // System status
  public query func getSystemStatus() : async {
    totalInstitutions: Nat;
    totalStudents: Nat;
    totalDocuments: Nat;
    totalTransactions: Nat;
    totalUsers: Nat;
  } {
    {
      totalInstitutions = institutions.size();
      totalStudents = students.size();
      totalDocuments = documents.size();
      totalTransactions = transactions.size();
      totalUsers = users.size();
    }
  };
  
  // Admin Functions
  
  public func getAllUsers() : async Result.Result<[User], Error> {
    // TODO: Implement proper authentication when msg.caller is available
    // For now, bypass authentication to allow testing
    let caller = Principal.fromText("2vxsx-fae");
    
    // Skip authentication for now
    // Check authentication and authorization
    // let authResult = requireAuth(caller);
    // let auth = switch (authResult) {
    //   case (#ok(a)) { a };
    //   case (#err(e)) { return #err(e) };
    // };
    
    // For now, return all users without authorization check
    let usersArray = Iter.toArray(users.entries());
    let allUsers = Array.map<(UserId, User), User>(usersArray, func((_, user)) = user);
    #ok(allUsers)
  };
}
