import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Types "./Types";

module Students {
  
  public type Student = Types.Student;
  public type StudentId = Types.StudentId;
  public type InstitutionId = Types.InstitutionId;
  public type UserId = Types.UserId;
  public type User = Types.User;
  public type UserRole = Types.UserRole;
  public type Institution = Types.Institution;
  public type Error = Types.Error;
  
  public class StudentService(
    students: Map.HashMap<StudentId, Student>,
    institutions: Map.HashMap<InstitutionId, Institution>,
    nextStudentId: () -> Nat,
    incrementStudentId: () -> (),
    registerUser: (Principal, Text, Text, Text, UserRole) -> async Result.Result<User, Error>,
    generateInvitationCode: (StudentId, InstitutionId, UserId) -> Result.Result<Text, Error>
  ) {
    
    public func registerStudentWithUser(
      caller: Principal,
      institutionId: InstitutionId,
      firstName: Text,
      lastName: Text,
      email: Text,
      studentNumber: Text,
      program: Text,
      yearLevel: Nat
    ) : async Result.Result<(Student, User), Error> {
      
      // Validate institution exists
      switch (institutions.get(institutionId)) {
        case null { return #err(#NotFound) };
        case (?_) {};
      };
      
      // Validate input
      if (Text.size(firstName) == 0 or Text.size(lastName) == 0 or Text.size(email) == 0) {
        return #err(#InvalidInput);
      };
      
      let studentId = "STU_" # Nat.toText(nextStudentId());
      incrementStudentId();
      
      // Create student user account
      let studentRole = #Student(studentId);
      let studentUserResult = await registerUser(caller, email, firstName, lastName, studentRole);
      
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
      
      let studentId = "STU_" # Nat.toText(nextStudentId());
      incrementStudentId();
      
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
    
    public func createStudentWithInvitationCode(
      institutionId: InstitutionId,
      firstName: Text,
      lastName: Text,
      email: Text,
      studentNumber: Text,
      program: Text,
      yearLevel: Nat,
      createdBy: UserId
    ) : async Result.Result<(Student, Text), Error> {
      
      // Validate institution exists
      switch (institutions.get(institutionId)) {
        case null { return #err(#NotFound) };
        case (?_) {};
      };
      
      // Validate input
      if (Text.size(firstName) == 0 or Text.size(lastName) == 0 or Text.size(email) == 0) {
        return #err(#InvalidInput);
      };
      
      let studentId = "STU_" # Nat.toText(nextStudentId());
      incrementStudentId();
      
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
      
      // Create invitation code
      let invitationResult = generateInvitationCode(studentId, institutionId, createdBy);
      switch (invitationResult) {
        case (#ok(code)) { #ok((newStudent, code)) };
        case (#err(error)) { #err(error) };
      };
    };
    
    public func getStudent(studentId: StudentId) : Result.Result<Student, Error> {
      switch (students.get(studentId)) {
        case (?student) { #ok(student) };
        case null { #err(#NotFound) };
      }
    };
    
    public func getStudentsByInstitution(institutionId: InstitutionId) : Result.Result<[Student], Error> {
      let studentsArray = Iter.toArray(students.entries());
      let allStudents = Array.map<(StudentId, Student), Student>(studentsArray, func((_, stu)) = stu);
      let filteredStudents = Array.filter<Student>(allStudents, func(student) = student.institutionId == institutionId);
      
      #ok(filteredStudents)
    };
    
    public func getMyStudentInfo(_caller: Principal) : async Result.Result<Student, Error> {
      // Find the student by their principal/caller
      let studentsArray = Iter.toArray(students.entries());
      
      // Look for a student whose associated user has this principal
      for ((studentId, student) in Iter.fromArray(studentsArray)) {
        switch (student.userId) {
          case (?_userId) {
            // Check if this user ID corresponds to the caller
            // Note: This would require a way to look up users by principal
            // For now, we'll need to implement this in the main.mo file
            // where we have access to the user service
          };
          case null {};
        };
      };
      
      #err(#NotFound)
    };
  }
}
