import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Types "./Types";

module Institutions {
  
  public type Institution = Types.Institution;
  public type InstitutionId = Types.InstitutionId;
  public type InstitutionType = Types.InstitutionType;
  public type User = Types.User;
  public type Error = Types.Error;
  
  public class InstitutionService(
    institutions: Map.HashMap<InstitutionId, Institution>,
    nextInstitutionId: () -> Nat,
    incrementInstitutionId: () -> (),
    registerUser: (Text, Text, Text, Types.UserRole) -> async Result.Result<User, Error>
  ) {
    
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
      
      let institutionId = "INST_" # Nat.toText(nextInstitutionId());
      incrementInstitutionId();
      
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
      
      let institutionId = "INST_" # Nat.toText(nextInstitutionId());
      incrementInstitutionId();
      
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
    
    public func getInstitution(institutionId: InstitutionId) : Result.Result<Institution, Error> {
      switch (institutions.get(institutionId)) {
        case (?institution) { #ok(institution) };
        case null { #err(#NotFound) };
      }
    };
    
    public func getAllInstitutions() : [Institution] {
      let institutionsArray = Iter.toArray(institutions.entries());
      Array.map<(InstitutionId, Institution), Institution>(institutionsArray, func((_, inst)) = inst)
    };
  }
}
