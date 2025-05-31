import Map "mo:base/HashMap";
import Types "./Types";

module Utils {
  
  public type SystemStatus = Types.SystemStatus;
  public type Institution = Types.Institution;
  public type Student = Types.Student;
  public type Document = Types.Document;
  public type Transaction = Types.Transaction;
  public type User = Types.User;
  public type InstitutionId = Types.InstitutionId;
  public type StudentId = Types.StudentId;
  public type DocumentId = Types.DocumentId;
  public type UserId = Types.UserId;
  
  public class UtilService(
    institutions: Map.HashMap<InstitutionId, Institution>,
    students: Map.HashMap<StudentId, Student>,
    documents: Map.HashMap<DocumentId, Document>,
    transactions: Map.HashMap<Text, Transaction>,
    users: Map.HashMap<UserId, User>
  ) {
    
    public func greet(name : Text) : Text {
      return "Hello, " # name # "! Welcome to Acadena - Academic Records Management System";
    };
    
    public func getSystemStatus() : SystemStatus {
      {
        totalInstitutions = institutions.size();
        totalStudents = students.size();
        totalDocuments = documents.size();
        totalTransactions = transactions.size();
        totalUsers = users.size();
      }
    };
  }
}
