import Map "mo:base/HashMap";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Principal "mo:base/Principal";
import Types "./Types";
import Blob "mo:base/Blob";
import Nat32 "mo:base/Nat32";

module TransacCreator {

  public type Transaction = Types.Transaction;
  public type TransactionId = Types.TransactionId;
  public type UserId = Types.UserId;
  public type User = Types.User;
  public type Error = Types.Error;
  public type TransactionType = Types.TransactionType;
  public type DocumentId = Types.DocumentId;

  public class TransactionService(
    transactions : Map.HashMap<TransactionId, Transaction>,
    users : Map.HashMap<UserId, User>,
    principalToUser : Map.HashMap<Principal, UserId>,
    nextTransactionId : () -> Nat,
    incrementTransactionId : () -> ()
  ) {

    public func createTransaction(
      toCaller : Principal,
      fromCaller : Principal,
      description : ?Text,
      transactionType : TransactionType
    ) : Result.Result<Transaction, Error> {

      let transactionId = nextTransactionId();
      incrementTransactionId();

      let transaction : Transaction = {
        id = Nat.toText(transactionId);

        from = fromCaller;
        to = toCaller;
        transactionType = transactionType; // example, adjust depending on your variant
        documentId = null;
        timestamp = Time.now();
        status = "Pending";
        notes = description;
      };

      transactions.put(transaction.id, transaction);
      #ok(transaction);
    };
  };
};
