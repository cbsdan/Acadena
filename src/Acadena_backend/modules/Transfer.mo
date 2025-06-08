import Map "mo:base/HashMap";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Types "./Types";
import Array "mo:base/Array";

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
  }
}
