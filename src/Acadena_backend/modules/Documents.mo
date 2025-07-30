// import Map "mo:base/HashMap";
// import Time "mo:base/Time";
// import Result "mo:base/Result";
// import Text "mo:base/Text";
// import Nat "mo:base/Nat";
// import Int "mo:base/Int";
// import Iter "mo:base/Iter";
// import Array "mo:base/Array";
// import Principal "mo:base/Principal";
// import Types "./Types";

// module Documents {

//   public type Document = Types.Document;
//   public type DocumentId = Types.DocumentId;
//   public type DocumentType = Types.DocumentType;
//   public type Student = Types.Student;
//   public type StudentId = Types.StudentId;
//   public type Institution = Types.Institution;
//   public type InstitutionId = Types.InstitutionId;
//   public type Transaction = Types.Transaction;
//   public type TransactionType = Types.TransactionType;
//   public type Error = Types.Error;

//   public class DocumentService(
//     documents: Map.HashMap<DocumentId, Document>,
//     students: Map.HashMap<StudentId, Student>,
//     institutions: Map.HashMap<InstitutionId, Institution>,
//     transactions: Map.HashMap<Text, Transaction>,
//     nextDocumentId: () -> Nat,
//     incrementDocumentId: () -> (),
//     nextTransactionId: () -> Nat,
//     incrementTransactionId: () -> ()
//   ) {
import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Types "./Types";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";
import _Hash "mo:base/Hash"; // If you want to hash for token
import Debug "mo:base/Debug";
import Bool "mo:base/Bool";

module Documents {

  public type Document = Types.Document;
  public type DocumentId = Types.DocumentId;
  public type DocumentType = Types.DocumentType;
  public type Student = Types.Student;
  public type StudentId = Types.StudentId;
  public type Institution = Types.Institution;
  public type InstitutionId = Types.InstitutionId;
  public type Transaction = Types.Transaction;
  public type TransactionType = Types.TransactionType;
  public type Error = Types.Error;
  public type AccessToken = Types.AccessToken;
  public type UserId = Types.UserId;
  public type User = Types.User;

  // Temporary storage for in-progress uploads
  type UploadSession = {
    studentId : StudentId;
    institutionId : InstitutionId;
    principal : Principal; // <-- add this
    documentType : DocumentType;
    title : Text;
    description : Text;
    fileName : Text;
    fileType : Text;
    chunks : [[Nat8]];
  };

  public class DocumentService(
    documents : Map.HashMap<DocumentId, Document>,
    students : Map.HashMap<StudentId, Student>,
    institutions : Map.HashMap<InstitutionId, Institution>,
    _transactions : Map.HashMap<Text, Transaction>,
    nextDocumentId : () -> Nat,
    incrementDocumentId : () -> (),
    _nextTransactionId : () -> Nat,
    _incrementTransactionId : () -> (),
    principalToUser : Map.HashMap<Principal, UserId>,
    users : Map.HashMap<UserId, User>,
  ) {
    let uploadSessions = Map.HashMap<Text, UploadSession>(10, Text.equal, Text.hash);

    // 1. Start upload session
    public func startUpload(
      caller : Principal, // <-- add this parameter
      sessionId : Text,
      studentId : StudentId,
      institutionId : InstitutionId,
      documentType : DocumentType,
      title : Text,
      description : Text,
      fileName : Text,
      fileType : Text,
    ) : async Result.Result<(), Error> {
      let principalText = Principal.toText(caller);
      Debug.print("🔍 DocumentService.startUpload: Received principal: " # principalText);
      Debug.print("🔍 DocumentService.startUpload: Principal length: " # Nat.toText(Text.size(principalText)));
      Debug.print("🔍 DocumentService.startUpload: Is anonymous (2vxsx-fae): " # Bool.toText(principalText == "2vxsx-fae"));

      if (uploadSessions.get(sessionId) != null) {
        return #err(#InvalidInput);
      };
      uploadSessions.put(
        sessionId,
        {
          studentId = studentId;
          institutionId = institutionId;
          principal = caller; // use the passed-in principal
          documentType = documentType;
          title = title;
          description = description;
          fileName = fileName;
          fileType = fileType;
          chunks = [];
        },
      );

      #ok(());
    };

    // 2. Upload a chunk
    public func uploadChunk(sessionId : Text, chunk : [Nat8]) : async Result.Result<(), Error> {
      switch (uploadSessions.get(sessionId)) {
        case (?session) {
          let updated = {
            session with
            chunks = Array.append(session.chunks, [chunk])
          };
          uploadSessions.put(sessionId, updated);
          #ok(());
        };
        case null { #err(#NotFound) };
      };
    };

    // 3. Finalize upload

    public func finalizeUpload(sessionId : Text) : async Result.Result<(Document, Text), Error> {
      switch (uploadSessions.get(sessionId)) {
        case (?session) {
          // ...existing validation code...

          let documentId = "DOC_" # Nat.toText(nextDocumentId());
          incrementDocumentId();

          let timeNow = Int.abs(Time.now());
          let signature = "SIG_" # documentId # "_" # Nat.toText(timeNow);

          let fileBytes = Array.flatten<Nat8>(session.chunks);

          // Use the stored principal
          let institutionPrincipal = session.principal;

          let newDocument : Document = {
            id = documentId;
            studentId = session.studentId;
            issuingInstitutionId = session.institutionId;
            documentType = session.documentType;
            title = session.title;
            content = "";
            description = ?session.description;
            file = ?Blob.fromArray(fileBytes);
            fileName = ?session.fileName;
            fileType = ?session.fileType;
            issueDate = Time.now();
            signature = signature;
            isVerified = true;
            currentOwner = institutionPrincipal;
            origOwner = institutionPrincipal;
            status = "processing";
          };

          documents.put(documentId, newDocument);

          // Record transaction (existing code)
          // let transactionId = "TXN_" # Nat.toText(nextTransactionId());
          // incrementTransactionId();
          // let transaction : Transaction = {
          //   id = transactionId;
          //   from = session.institutionId;
          //   to = session.studentId;
          //   transactionType = #DocumentIssue;
          //   documentId = ?documentId;
          //   timestamp = Time.now();
          //   status = "completed";
          //   notes = ?("Document uploaded: " # session.title);
          // };
          // transactions.put(transactionId, transaction);

          // // Remove session
          // uploadSessions.delete(sessionId);

          // --- Generate a token (for example, hash of documentId + signature) ---
          let token = Nat32.toText(Text.hash(documentId # signature));

          #ok((newDocument, token));
        };
        case null { #err(#NotFound) };
      };
    };

    public func issueDocument(
      studentId : StudentId,
      issuingInstitutionId : InstitutionId,
      documentType : DocumentType,
      title : Text,
      content : Text,
    ) : async Result.Result<Document, Error> {

      // Use anonymous principal for this function since it's not user-facing
      let _caller = Principal.fromText("2vxsx-fae");

      // Validate student and institution exist
      switch (students.get(studentId), institutions.get(issuingInstitutionId)) {
        case (?_, ?_) {};
        case (_, _) { return #err(#NotFound) };
      };

      // Validate input
      if (Text.size(title) == 0 or Text.size(content) == 0) {
        return #err(#InvalidInput);
      };

      let documentId = "DOC_" # Nat.toText(nextDocumentId());
      incrementDocumentId();

      let timeNow = Int.abs(Time.now());

      // Generate digital signature (simplified)
      let signature = "SIG_" # documentId # "_" # Nat.toText(timeNow);

      // Use the institution principal as both origOwner and currentOwner
      let institutionPrincipal = Principal.fromText(issuingInstitutionId);

      let newDocument : Document = {
        id = documentId;
        studentId = studentId;
        issuingInstitutionId = issuingInstitutionId;
        documentType = documentType;
        title = title;
        content = content;
        description = null;
        file = null;
        fileName = null;
        fileType = null;
        issueDate = Time.now();
        signature = signature;
        isVerified = true;
        currentOwner = institutionPrincipal;
        origOwner = institutionPrincipal;
        status = "processing";
      };

      documents.put(documentId, newDocument);

      // Record transaction
      // let transactionId = "TXN_" # Nat.toText(nextTransactionId());
      // incrementTransactionId();

      // let transaction : Transaction = {
      //   id = transactionId;
      //   from = issuingInstitutionId;
      //   to = studentId;
      //   transactionType = #DocumentIssue;
      //   documentId = ?documentId;
      //   timestamp = Time.now();
      //   status = "completed";
      //   notes = ?("Document issued: " # title);
      // };

      // transactions.put(transactionId, transaction);

      #ok(newDocument);
    };
    public func getDocument(documentId : DocumentId) : Result.Result<Document, Error> {
      switch (documents.get(documentId)) {
        case (?document) { #ok(document) };
        case null { #err(#NotFound) };
      };
    };

    public func getMyDocuments(caller : Principal) : async Result.Result<[Document], Error> {
      // Get user ID from principal
      switch (principalToUser.get(caller)) {
        case null { return #err(#Unauthorized) };
        case (?userId) {
          // Get user info
          switch (users.get(userId)) {
            case null { return #err(#NotFound) };
            case (?user) {
              // Check if user is a student
              switch (user.role) {
                case (#Student(studentId)) {
                  // Get documents for this student
                  let documentsArray = Iter.toArray(documents.entries());
                  let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
                  let studentDocuments = Array.filter<Document>(allDocuments, func(document) = document.studentId == studentId);
                  return #ok(studentDocuments);
                };
                case (_) { return #err(#Unauthorized) };
              };
            };
          };
        };
      };
    };

    public func getDocumentsByStudentInt(studentId : StudentId, caller : Principal) : async Result.Result<[Document], Error> {
      // Use provided caller
      let _caller = caller;

      let documentsArray = Iter.toArray(documents.entries());
      let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
      let studentDocuments = Array.filter<Document>(allDocuments, func(document) = document.studentId == studentId);

      return #ok(studentDocuments);
    };

    public func getDocumentsByInstitution(institutionId : InstitutionId) : async Result.Result<[Document], Error> {
      let documentsArray = Iter.toArray(documents.entries());
      let allDocuments = Array.map<(DocumentId, Document), Document>(documentsArray, func((_, doc)) = doc);
      let institutionDocuments = Array.filter<Document>(
        allDocuments,
        func(document) = document.issuingInstitutionId == institutionId,
      );
      #ok(institutionDocuments);
    };
  };
};
