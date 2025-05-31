import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Types "./Types";

module Users {
  
  public type User = Types.User;
  public type UserId = Types.UserId;
  public type UserRole = Types.UserRole;
  public type Error = Types.Error;
  
  public class UserService(
    users: Map.HashMap<UserId, User>,
    principalToUser: Map.HashMap<Principal, UserId>,
    nextUserId: () -> Nat,
    incrementUserId: () -> ()
  ) {
    
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
      
      let userId = "USER_" # Nat.toText(nextUserId());
      incrementUserId();
      
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
    
    public func getAllUsers() : async Result.Result<[User], Error> {
      // TODO: Implement proper authentication when msg.caller is available
      // For now, bypass authentication to allow testing
      let _caller = Principal.fromText("2vxsx-fae");
      
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
}
