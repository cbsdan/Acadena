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
    users : Map.HashMap<UserId, User>,
    principalToUser : Map.HashMap<Principal, UserId>,
    nextUserId : () -> Nat,
    incrementUserId : () -> (),
  ) {

    public func registerUser(
      caller : Principal,
      email : Text,
      firstName : Text,
      lastName : Text,
      role : UserRole,
    ) : async Result.Result<User, Error> {
      // Use the actual caller principal from Internet Identity

      // Check if user already exists
      switch (principalToUser.get(caller)) {
        case (?_) { return #err(#AlreadyExists) };
        case null {};
      };

      // Validate input
      if (Text.size(email) == 0 or Text.size(firstName) == 0 or Text.size(lastName) == 0) {
        return #err(#InvalidInput);
      };

      let userId = "USER_" # Nat.toText(nextUserId());
      incrementUserId();

      let user : User = {
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

      #ok(user);
    };

    public func getCurrentUserInfo(caller : Principal) : async ?User {
      // Use the actual caller principal from Internet Identity
      switch (principalToUser.get(caller)) {
        case (?userId) { users.get(userId) };
        case null { null };
      };
    };

    public func getAllUsers(caller : Principal) : async Result.Result<[User], Error> {
      // Check authentication and authorization - only system admins can view all users
      switch (principalToUser.get(caller)) {
        case (?userId) {
          switch (users.get(userId)) {
            case (?user) {
              switch (user.role) {
                case (#SystemAdmin) {
                  // System admin can view all users
                  let usersArray = Iter.toArray(users.entries());
                  let allUsers = Array.map<(UserId, User), User>(usersArray, func((_, user)) = user);
                  #ok(allUsers);
                };
                case (_) { #err(#Unauthorized) };
              };
            };
            case null { #err(#Unauthorized) };
          };
        };
        case null { #err(#Unauthorized) };
      };
    };

    public func getAllUsersWithoutAdmin(caller : Principal) : async Result.Result<[User], Error> {
      // Simply check if the caller is registered (no role check)
      switch (principalToUser.get(caller)) {
        case (?_) {
          let usersArray = Iter.toArray(users.entries());
          let allUsers = Array.map<(UserId, User), User>(usersArray, func((_, user)) = user);
          #ok(allUsers);
        };
        case null { #err(#Unauthorized) }; // Reject unregistered users
      };
    };
  };
};
