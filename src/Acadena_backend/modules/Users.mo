import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Types "./Types";
import Bool "mo:base/Bool";
module Users {

  public type User = Types.User;
  public type UserId = Types.UserId;
  public type UserRole = Types.UserRole;
  public type Error = Types.Error;

  public class UserService(
    users : Map.HashMap<UserId, User>,
    principalToUser : Map.HashMap<Principal, UserId>,
    nextUserId : () -> Nat,
    incrementUserId : () -> (),
  ) {

    public func registerUser(
      caller : Principal,
      email : Text,
      // firstName : Text,
      // lastName : Text,
      role : UserRole,
    ) : async Result.Result<User, Error> {
      // Enhanced debugging
      let principalText = Principal.toText(caller);
      Debug.print("🔍 UserService.registerUser: Received principal: " # principalText);
      Debug.print("🔍 UserService.registerUser: Principal length: " # Nat.toText(Text.size(principalText)));
      Debug.print("🔍 UserService.registerUser: Is anonymous (2vxsx-fae): " # Bool.toText(principalText == "2vxsx-fae"));

      // Check if user already exists
      switch (principalToUser.get(caller)) {
        case (?_) { return #err(#AlreadyExists) };
        case null {};
      };

      // Validate input
      // if (Text.size(email) == 0 or Text.size(firstName) == 0 or Text.size(lastName) == 0) {
      //   return #err(#InvalidInput);
      // };

      let userId = "USER_" # Nat.toText(nextUserId());
      incrementUserId();

      let user : User = {
        id = userId;
        principal = caller;
        role = role;
        email = email;
        // firstName = firstName;
        // lastName = lastName;
        createdDate = Time.now();
        lastLoginDate = null;
        isActive = true;
      };

      users.put(userId, user);
      principalToUser.put(caller, userId);

      #ok(user);
    };

    public func getCurrentUserInfo(caller : Principal) : async ?User {
      switch (principalToUser.get(caller)) {
        case (?userId) { users.get(userId) };
        case null { null };
      };
    };

    public func getAllUsers() : async Result.Result<[User], Error> {
      //TODO: Implement proper authorization check

      // Add proper authorization check here if needed
      let usersArray = Iter.toArray(users.entries());
      let allUsers = Array.map<(UserId, User), User>(usersArray, func((_, user)) = user);
      #ok(allUsers);
    };
  };
};
