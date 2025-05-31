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
  
  public class DocumentService(
    documents: Map.HashMap<DocumentId, Document>,
    students: Map.HashMap<StudentId, Student>,
    institutions: Map.HashMap<InstitutionId, Institution>,
    transactions: Map.HashMap<Text, Transaction>,
    nextDocumentId: () -> Nat,
    incrementDocumentId: () -> (),
    nextTransactionId: () -> Nat,
    incrementTransactionId: () -> ()
  ) {
    
    public func issueDocument(
      studentId: StudentId,
      issuingInstitutionId: InstitutionId,
      documentType: DocumentType,
      title: Text,
      content: Text
    ) : async Result.Result<Document, Error> {
      
      // TODO: Implement proper authentication when msg.caller is available
      // For now, bypass authentication to allow testing
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
      let transactionId = "TXN_" # Nat.toText(nextTransactionId());
      incrementTransactionId();
      
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
    
    public func getDocument(documentId: DocumentId) : Result.Result<Document, Error> {
      switch (documents.get(documentId)) {
        case (?document) { #ok(document) };
        case null { #err(#NotFound) };
      }
    };
    
    public func getMyDocuments() : async Result.Result<[Document], Error> {
      // TODO: Implement proper authentication when msg.caller is available
      // For now, bypass authentication to allow testing
      let _caller = Principal.fromText("2vxsx-fae");
      
      // For now, return empty array since we can't identify the user
      #ok([])
    };
    
    public func getDocumentsByStudent(studentId: StudentId) : async Result.Result<[Document], Error> {
      // TODO: Implement proper authentication when msg.caller is available
      // For now, bypass authentication to allow testing
      let _caller = Principal.fromText("2vxsx-fae");
      
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
  }
}
