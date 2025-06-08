import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Types "./Types";
import Array "mo:base/Array";
import Result "mo:base/Result";
import Principal "mo:base/Principal";

module {
  public type TransferInstitute = Types.TransferInstitute;
  public type TransferId = Types.TransferId;
  public type StudentId = Types.StudentId;
  public type InstitutionId = Types.InstitutionId;
  public type Error = Types.Error;

  public class TransferService(
    transferRequests : Map.HashMap<TransferId, TransferInstitute>,
    getNextTransferId : () -> Nat,
    incrementTransferId : () -> ()
  ) {
    public func createTransferRequest(
      studentId : StudentId,
      fromInstitutionId : InstitutionId,
      toInstitutionId : InstitutionId,
      notes : ?Text
    ) : TransferInstitute {
      let id = "TRANSFER_" # Nat.toText(getNextTransferId());
      incrementTransferId();
      let now = Int.abs(Time.now());
      let transfer : TransferInstitute = {
        id = id;
        studentId = studentId;
        fromInstitutionId = fromInstitutionId;
        toInstitutionId = toInstitutionId;
        transferDate = now;
        status = "pending";
        notes = notes;
        isVerified = false;
      };
      transferRequests.put(id, transfer);
      transfer
    };

    public func getAllTransferRequests() : [TransferInstitute] {
      Iter.toArray(transferRequests.vals())
    };

    public func getTransferRequestsForInstitution(
      caller : Principal,
      principalToUser : Map.HashMap<Principal, Types.UserId>,
      users : Map.HashMap<Types.UserId, Types.User>
    ) : [TransferInstitute] {
      let userOpt = principalToUser.get(caller);
      switch (userOpt) {
        case (?userId) {
          let user = users.get(userId);
          switch (user) {
            case (?u) {
              switch (u.role) {
                case (#InstitutionAdmin(institutionId)) {
                  let allRequests = Iter.toArray(transferRequests.vals());
                  Array.filter<TransferInstitute>(allRequests, func (req) {
                    Text.equal(req.toInstitutionId, institutionId)
                  })
                };
                case _ [];
              }
            };
            case null [];
          }
        };
        case null [];
      }
    };

    public func transferStudentToInstitution(
      caller : Principal,
      studentId : StudentId,
      toInstitutionId : InstitutionId,
      principalToUser : Map.HashMap<Principal, Types.UserId>,
      users : Map.HashMap<Types.UserId, Types.User>
    ) : Result.Result<TransferInstitute, Text> {
      let userOpt = principalToUser.get(caller);
      switch (userOpt) {
        case (?userId) {
          let user = users.get(userId);
          switch (user) {
            case (?u) {
              switch (u.role) {
                case (#InstitutionAdmin(fromInstitutionId)) {
                  let transfer = createTransferRequest(studentId, fromInstitutionId, toInstitutionId, null);
                  return #ok(transfer);
                };
                case _ return #err("Only institution admins can transfer students");
              }
            };
            case null return #err("User not found");
          }
        };
        case null return #err("Not authenticated");
      }
    };

    public func acceptTransferRequest(
      caller : Principal,
      transferId : Types.TransferId,
      principalToUser : Map.HashMap<Principal, Types.UserId>,
      users : Map.HashMap<Types.UserId, Types.User>,
      students : Map.HashMap<Types.StudentId, Types.Student>,
      documents : Map.HashMap<Types.DocumentId, Types.Document>,
      transferRequests : Map.HashMap<Types.TransferId, TransferInstitute>
    ) : Result.Result<Text, Text> {
      let userOpt = principalToUser.get(caller);
      switch (userOpt) {
        case (?userId) {
          let user = users.get(userId);
          switch (user) {
            case (?u) {
              switch (u.role) {
                case (#InstitutionAdmin(myInstitutionId)) {
                  let transferOpt = transferRequests.get(transferId);
                  switch (transferOpt) {
                    case (?transfer) {
                      if (transfer.toInstitutionId != myInstitutionId) {
                        return #err("You are not authorized to accept this transfer");
                      };
                      // Update student institution
                      let studentOpt = students.get(transfer.studentId);
                      switch (studentOpt) {
                        case (?student) {
                          let updatedStudent = { student with institutionId = transfer.toInstitutionId };
                          students.put(transfer.studentId, updatedStudent);
                          // Update all documents' currentOwner
                          var newOwnerPrincipal : Principal = Principal.fromText("aaaaa-aa"); // fallback
                          label searchAdmin for ((_, u) in users.entries()) {
                            switch (u.role) {
                              case (#InstitutionAdmin(id)) {
                                if (id == transfer.toInstitutionId) {
                                  newOwnerPrincipal := u.principal;
                                  break searchAdmin;
                                }
                              };
                              case _ {};
                            }
                          };
                          for ((docId, doc) in documents.entries()) {
                            if (doc.studentId == transfer.studentId) {
                              let updatedDoc = { doc with currentOwner = newOwnerPrincipal };
                              documents.put(docId, updatedDoc);
                            }
                          };
                          // Mark transfer as accepted
                          let updatedTransfer = { transfer with status = "accepted" };
                          transferRequests.put(transferId, updatedTransfer);
                          return #ok("Transfer accepted and student ownership updated");
                        };
                        case null return #err("Student not found");
                      }
                    };
                    case null return #err("Transfer request not found");
                  }
                };
                case _ return #err("Only institution admins can accept transfers");
              }
            };
            case null return #err("User not found");
          }
        };
        case null return #err("Not authenticated");
      }
    };
  }
}


