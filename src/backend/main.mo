import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

actor {
  type Name = Text;
  type PhoneNumber = Text;
  type Address = Text;
  type Email = Text;

  type CustomerId = Nat;
  type Description = Text;
  type Price = Nat; // represents cents
  type Quantity = Nat;
  type InvoiceId = Nat;

  type Customer = {
    id : CustomerId;
    name : Name;
    phone : PhoneNumber;
    address : Address;
    email : Email;
  };

  type InvoiceLineItem = {
    description : Description;
    quantity : Quantity;
    unitPrice : Price;
  };

  type Invoice = {
    id : InvoiceId;
    customerId : CustomerId;
    items : [InvoiceLineItem];
    amountPaid : Nat;
    amountDue : Nat;
    isPaid : Bool;
  };

  var nextCustomerId = 1;
  var nextInvoiceId = 1;

  let customerStore = Map.empty<CustomerId, Customer>();
  let invoiceStore = Map.empty<InvoiceId, Invoice>();

  // Helper to calculate total for InvoiceLineItems
  func calculateTotalAmountitems(items : [InvoiceLineItem]) : Nat {
    var total = 0;
    for (item in items.values()) {
      total += item.unitPrice * item.quantity;
    };
    total;
  };

  // Customer Functions
  public shared ({ caller }) func addCustomer(name : Text, phone : PhoneNumber, address : Address, email : Email) : async CustomerId {
    let id = nextCustomerId;
    nextCustomerId += 1;

    let customer : Customer = {
      id;
      name;
      phone;
      address;
      email;
    };

    customerStore.add(id, customer);
    id;
  };

  public query ({ caller }) func getCustomer(id : CustomerId) : async ?Customer {
    customerStore.get(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    customerStore.values().toArray();
  };

  // Invoice Functions
  public shared ({ caller }) func createInvoice(customerId : CustomerId, items : [InvoiceLineItem]) : async InvoiceId {
    let id = nextInvoiceId;
    nextInvoiceId += 1;

    let amountDue = calculateTotalAmountitems(items);

    let invoice : Invoice = {
      id;
      customerId;
      items;
      amountPaid = 0;
      amountDue;
      isPaid = false;
    };

    invoiceStore.add(id, invoice);
    id;
  };

  public shared ({ caller }) func recordPayment(invoiceId : InvoiceId, paymentAmount : Nat) : async Bool {
    switch (invoiceStore.get(invoiceId)) {
      case (?invoice) {
        let newAmountPaid = invoice.amountPaid + paymentAmount;
        let isFullyPaid = newAmountPaid >= invoice.amountDue;

        let updatedInvoice : Invoice = {
          id = invoice.id;
          customerId = invoice.customerId;
          items = invoice.items;
          amountPaid = newAmountPaid;
          amountDue = invoice.amountDue;
          isPaid = isFullyPaid;
        };

        invoiceStore.add(invoiceId, updatedInvoice);
        true;
      };
      case (null) { false };
    };
  };

  public query ({ caller }) func getInvoice(id : InvoiceId) : async ?Invoice {
    invoiceStore.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    invoiceStore.values().toArray();
  };
};
