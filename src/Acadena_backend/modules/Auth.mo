import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Types "./Types";

module Auth {
  
  public type AuthContext = Types.AuthContext;
  public type UserRole = Types.UserRole;
  public type User = Types.User;
  public type UserId = Types.UserId;
  public type Error = Types.Error;
  
  public class AuthService(
    users: Map.HashMap<UserId, User>,
    principalToUser: Map.HashMap<Principal, UserId>
  ) {
    
    public func getCurrentUser(caller: Principal) : ?AuthContext {
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
    
    public func requireAuth(caller: Principal) : Result.Result<AuthContext, Error> {
      switch (getCurrentUser(caller)) {
        case (?auth) { #ok(auth) };
        case null { #err(#Unauthorized) };
      }
    };
    
    public func requireRole(requiredRole: UserRole, auth: AuthContext) : Bool {
      switch (requiredRole, auth.role) {
        case (#SystemAdmin, #SystemAdmin) { true };
        case (#InstitutionAdmin(reqInst), #InstitutionAdmin(userInst)) { reqInst == userInst };
        case (#Student(reqStudent), #Student(userStudent)) { reqStudent == userStudent };
        case (#SystemAdmin, _) { true }; // System admin can access everything
        case (_, _) { false };
      }
    };
    
    public func validateInput(fields: [Text]) : Bool {
      for (field in fields.vals()) {
        if (Text.size(field) == 0) {
          return false;
        };
      };
      true
    };
  }
}
