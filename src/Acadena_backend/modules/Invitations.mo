import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Char "mo:base/Char";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Types "./Types";

module Invitations {
  
  public type InvitationCode = Types.InvitationCode;
  public type Student = Types.Student;
  public type StudentId = Types.StudentId;
  public type InstitutionId = Types.InstitutionId;
  public type UserId = Types.UserId;
  public type User = Types.User;
  public type Error = Types.Error;
  
  public class InvitationService(
    invitationCodes: Map.HashMap<Text, InvitationCode>,
    students: Map.HashMap<StudentId, Student>,
    users: Map.HashMap<UserId, User>,
    principalToUser: Map.HashMap<Principal, UserId>,
    nextUserId: () -> Nat,
    incrementUserId: () -> ()
  ) {
    
    // Helper functions
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
    
    public func createInvitationCode(
      studentId: StudentId,
      institutionId: InstitutionId,
      createdBy: UserId
    ) : Result.Result<Text, Error> {
      
      // Check if student exists
      switch (students.get(studentId)) {
        case null { return #err(#NotFound) };
        case (?_student) {
          // Check if student already has a valid invitation code
          for ((code, invitation) in invitationCodes.entries()) {
            if (invitation.studentId == studentId and isInvitationCodeValid(invitation)) {
              return #err(#AlreadyExists);
            };
          };
          
          let code = generateInvitationCode();
          let invitation: InvitationCode = {
            code = code;
            studentId = studentId;
            institutionId = institutionId;
            createdBy = createdBy;
            createdDate = Time.now();
            expiryDate = Time.now() + (30 * 24 * 60 * 60 * 1000000000); // 30 days
            isUsed = false;
            usedBy = null;
            usedDate = null;
          };
          
          invitationCodes.put(code, invitation);
          #ok(code)
        };
      };
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
              let userId = "USER_" # Nat.toText(nextUserId());
              incrementUserId();
              
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
    
    public func getInvitationCodeInfo(code: Text) : Result.Result<{
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
    
    public func getMyInvitationCodes() : Result.Result<[{
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
      let _caller = Principal.fromText("2vxsx-fae");
      
      // For now, return all invitation codes since we can't identify the user
      let invitationsArray = Iter.toArray(invitationCodes.entries());
      
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
  }
}
