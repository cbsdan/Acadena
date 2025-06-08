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
import Debug "mo:base/Debug";
import Documents "Documents";
import Nat64 "mo:base/Nat64";

module TransacCreator {

  public type Transaction = Types.Transaction;
  public type Documents = Types.Document;
  public type TransactionId = Types.TransactionId;
  public type UserId = Types.UserId;
  public type User = Types.User;
  public type Error = Types.Error;
  public type TransactionType = Types.TransactionType;
  public type DocumentId = Types.DocumentId;
  public type DocumentType = Types.DocumentType;
  public class TransactionService(
    transactions : Map.HashMap<TransactionId, Transaction>,
    users : Map.HashMap<UserId, User>,
    principalToUser : Map.HashMap<Principal, UserId>,
    documents : Map.HashMap<DocumentId, Documents>,
    tokens : Map.HashMap<Types.AccessTokenId, Types.AccessToken>,

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

      public func searchDocumentsByTitle(
        filter : Text,
        studentNumber : Text
      ) : async Result.Result<[Documents], Error> {

       Debug.print("Searching documents with filter: " # filter # " for student: " # studentNumber);
        let docTypeOpt : ?DocumentType = switch (filter) {
          case ("Transcript") { ?#Transcript };
          case ("Certificate") { ?#Certificate };
          case ("Diploma") { ?#Diploma };
          case ("Recommendation") { ?#Recommendation };
          case ("Other") { ?#Other("Other") };
          case _ { null };
        };

        switch (docTypeOpt) {
          case (?docType) {
            let filteredDocs = Iter.toArray(
              Iter.filter<Documents>(
                documents.vals(),
                func(doc : Documents) : Bool {
                  doc.documentType == docType and doc.studentId == studentNumber
                }
              )
            );
            #ok(filteredDocs)
          };
          case null {
            #err(#NotFound())
          }
        }
      };


  

      public func createAccessTokensForDocuments(
        docIds: [DocumentId],
        studentId: Types.StudentId
      ) : Result.Result<[Types.AccessToken], Error> {
        let now = Time.now();
        let nowNat = Nat64.toNat(Nat64.fromIntWrap(now));
        let createdTokens = Array.map<Types.DocumentId, Types.AccessToken>(docIds, func(docId) {
          let tokenId = "token-" # docId # "-" # Nat.toText(nowNat % 1000000000);
          let tokenStr = docId # "-" # Nat.toText(nowNat);
          {
            id = tokenId;
            tokenTitle = "Access for " # docId;
            documentId = docId;
            studentId = studentId;
            token = tokenStr;
            createdDate = now;
            isActive = true;
          }
        });
        for (token in createdTokens.vals()) {
          tokens.put(token.id, token);
        };
        #ok(createdTokens)
      };

    // Returns all documents for a student that has access tokens
    public func getDocumentsByStudentAccessTokens(studentId: Types.StudentId) : [Documents] {
      let tokensForStudent = Iter.toArray(
        Iter.filter<Types.AccessToken>(tokens.vals(), func(token) {
          token.studentId == studentId
        })
      );
      let docIds = Array.map<Types.AccessToken, DocumentId>(tokensForStudent, func(token) { token.documentId });
      let docs = Array.map<DocumentId, ?Documents>(docIds, func(docId) {
        documents.get(docId)
      });
      let filteredDocs = Array.filter<?Documents>(docs, func(optDoc) { optDoc != null });
      Array.map<?Documents, Documents>(filteredDocs, func(optDoc) { switch(optDoc) { case (?doc) doc; case null { Debug.trap("Unexpected null"); } } })
    };

    
    




  };
};
