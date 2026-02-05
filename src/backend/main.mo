import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Iter "mo:core/Iter";
import CurTime "mo:core/Time";
import Nat "mo:core/Nat";



actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Name = Text;
  type PhoneNumber = Text;
  type Address = Text;
  type Email = Text;
  type CustomerId = Nat;
  type Description = Text;
  type Price = Nat;
  type Quantity = Nat;
  type Discount = Nat; // Now represents percentage discount (0-100)
  type InvoiceId = Nat;
  type ServiceId = Nat;
  type PhotoId = Text;
  type WorkOrderId = Nat;

  type Customer = {
    id : CustomerId;
    name : Name;
    phone : PhoneNumber;
    address : Address;
    email : Email;
  };

  public type CustomerInput = {
    name : Name;
    phone : PhoneNumber;
    address : Address;
    email : Email;
  };

  public type WorkOrderStatus = {
    #pending_payment;
    #finalized;
    #sent_for_approval;
    #in_progress;
    #cancelled;
    #approved;
    #complete;
  };

  type InvoiceLineItem = {
    description : Description;
    quantity : Quantity;
    unitPrice : Price;
    discount : Discount; // Discount percentage (0-100)
  };

  public type InvoiceInput = {
    customerId : CustomerId;
    items : [InvoiceLineItem];
  };

  type Service = {
    id : ServiceId;
    name : Text;
    serviceType : ?Text;
    price : ?Nat;
    service : ?Text;
    notes : ?Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type Photo = {
    id : PhotoId;
    blobId : Text;
    filename : ?Text;
    contentType : Text;
  };

  type Invoice = {
    id : InvoiceId;
    customerId : CustomerId;
    items : [InvoiceLineItem];
    amountPaid : Nat;
    amountDue : Nat;
    isPaid : Bool;
    beforePhotos : [Photo];
    afterPhotos : [Photo];
    createdAt : Nat; // Timestamp of invoice creation
  };

  type WorkOrder = {
    id : WorkOrderId;
    description : Text;
    customerId : CustomerId;
    services : [ServiceId];
    createdAt : Int;
    status : WorkOrderStatus;
    notes : ?Text;
    cost : Nat;
    images : [Photo];
  };

  type CreateWorkOrderInput = {
    description : Text;
    customerId : CustomerId;
    services : [ServiceId];
    status : WorkOrderStatus;
    notes : ?Text;
    cost : Nat;
    images : ?[Photo];
  };

  type UpdateWorkOrderInput = CreateWorkOrderInput;

  public type WorkOrderWithCustomerName = {
    id : WorkOrderId;
    description : Text;
    customerName : Text;
    message : ?Text;
    cost : Nat;
    createdAt : Int;
    status : WorkOrderStatus;
    notes : ?Text;
    images : [Photo];
    services : [ServiceId];
  };

  public type BulkImportResult = {
    id : ?Nat;
    service : ?Service;
    input : ?CreateServiceInput;
    message : ?Text;
    isSuccess : Bool;
  };

  public type CreateServiceInput = {
    name : Text;
    serviceType : ?Text;
    price : ?Nat;
    service : ?Text;
    notes : ?Text;
  };

  var nextCustomerId = 1;
  var nextInvoiceId = 1;
  var nextServiceId = 1;
  var nextWorkOrderId = 1;

  let customerStore = Map.empty<CustomerId, Customer>();
  let invoiceStore = Map.empty<InvoiceId, Invoice>();
  let serviceStore = Map.empty<ServiceId, Service>();
  let workOrderStore = Map.empty<WorkOrderId, WorkOrder>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  func calculateTotalAmountItems(items : [InvoiceLineItem]) : Nat {
    var total = 0;
    for (item in items.values()) {
      let lineTotal = item.unitPrice * item.quantity;
      let discountValue = if (item.discount > 100) { 100 } else { item.discount };
      let discountedTotal = if (lineTotal == 0) { 0 } else {
        if (discountValue >= 100) { 0 } else {
          let discountAmount = switch (lineTotal * discountValue / 100) {
            case (value) { Nat.min(lineTotal, value) };
          };
          switch (lineTotal - discountAmount) {
            case (value) { value };
          };
        };
      };
      total += discountedTotal;
    };
    total;
  };

  public shared ({ caller }) func createService(input : CreateServiceInput) : async ServiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create services");
    };

    let serviceId = nextServiceId;
    nextServiceId += 1;

    let service : Service = {
      id = serviceId;
      name = input.name;
      serviceType = input.serviceType;
      price = input.price;
      service = input.service;
      notes = input.notes;
    };

    serviceStore.add(serviceId, service);
    serviceId;
  };

  public shared ({ caller }) func bulkImportServices(services : [CreateServiceInput]) : async [BulkImportResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can import services");
    };
    services.map(func(service) { createServiceInternal(service) });
  };

  func createServiceInternal(input : CreateServiceInput) : BulkImportResult {
    switch (input.price) {
      case (null) {
        {
          id = null;
          service = null;
          input = null;
          message = ?("Invalid input. Price must be non-empty and positive.");
          isSuccess = false;
        };
      };
      case (?(0)) {
        {
          id = null;
          service = null;
          input = null;
          message = ?("Invalid input. Price must be non-zero and positive.");
          isSuccess = false;
        };
      };
      case (?(price)) {
        if (input.name.size() == 0) {
          return {
            id = null;
            service = null;
            input = null;
            message = ?("Invalid input. Name must be non-empty and positive.");
            isSuccess = false;
          };
        };

        let serviceId = nextServiceId;
        nextServiceId += 1;

        let service : Service = {
          id = serviceId;
          name = input.name;
          serviceType = input.serviceType;
          price = input.price;
          service = input.service;
          notes = input.notes;
        };

        serviceStore.add(serviceId, service);

        {
          id = ?service.id;
          service = ?service;
          input = null;
          message = ?("Successfully imported service '" # input.name # "' (ID: " # service.id.toText() # ")");
          isSuccess = true;
        };
      };
    };
  };

  public shared ({ caller }) func updateService(serviceId : ServiceId, input : CreateServiceInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update services");
    };

    switch (serviceStore.get(serviceId)) {
      case (null) {
        Runtime.trap("Service not found");
      };
      case (?existingService) {
        let updatedService : Service = {
          id = serviceId;
          name = input.name;
          serviceType = input.serviceType;
          price = input.price;
          service = input.service;
          notes = input.notes;
        };

        serviceStore.add(serviceId, updatedService);
      };
    };
  };

  public query ({ caller }) func listServices() : async [Service] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view services");
    };
    serviceStore.values().toArray();
  };

  public shared ({ caller }) func addCustomer(name : Text, phone : PhoneNumber, address : Address, email : Email) : async CustomerId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add customers");
    };

    let customerId = nextCustomerId;
    nextCustomerId += 1;

    let customer : Customer = {
      id = customerId;
      name = name;
      phone = phone;
      address = address;
      email = email;
    };

    customerStore.add(customerId, customer);
    customerId;
  };

  public shared ({ caller }) func updateCustomer(id : CustomerId, input : CustomerInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update customers");
    };

    switch (customerStore.get(id)) {
      case (null) {
        Runtime.trap("Customer not found");
      };
      case (?existingCustomer) {
        let updatedCustomer : Customer = {
          id;
          name = input.name;
          phone = input.phone;
          address = input.address;
          email = input.email;
        };
        customerStore.add(id, updatedCustomer);
      };
    };
  };

  public query ({ caller }) func getCustomer(id : CustomerId) : async ?Customer {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customerStore.get(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view customers");
    };
    customerStore.values().toArray();
  };

  public shared ({ caller }) func createInvoice(customerId : CustomerId, items : [InvoiceLineItem]) : async InvoiceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create invoices");
    };

    let invoiceId = nextInvoiceId;
    nextInvoiceId += 1;

    let totalAmount = calculateTotalAmountItems(items);

    let invoice : Invoice = {
      id = invoiceId;
      customerId;
      items;
      amountPaid = 0;
      amountDue = totalAmount;
      isPaid = false;
      beforePhotos = [];
      afterPhotos = [];
      createdAt = if (CurTime.now() > 0) { CurTime.now().toNat() } else { 0 };
    };

    invoiceStore.add(invoiceId, invoice);
    invoiceId;
  };

  public shared ({ caller }) func updateInvoice(id : InvoiceId, input : InvoiceInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update invoices");
    };

    switch (invoiceStore.get(id)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?existingInvoice) {
        let totalAmount = calculateTotalAmountItems(input.items);
        let updatedInvoice : Invoice = {
          id;
          customerId = input.customerId;
          items = input.items;
          amountPaid = existingInvoice.amountPaid;
          amountDue = if (existingInvoice.amountPaid > totalAmount) { 0 } else { totalAmount - existingInvoice.amountPaid };
          isPaid = existingInvoice.amountPaid >= totalAmount;
          beforePhotos = existingInvoice.beforePhotos;
          afterPhotos = existingInvoice.afterPhotos;
          createdAt = existingInvoice.createdAt;
        };
        invoiceStore.add(id, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func recordPayment(invoiceId : InvoiceId, paymentAmount : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record payments");
    };

    switch (invoiceStore.get(invoiceId)) {
      case null { false };
      case (?invoice) {
        let newAmountPaid = invoice.amountPaid + paymentAmount;
        let totalDueWithDiscounts = calculateTotalAmountItems(invoice.items);
        let newAmountDue = if (newAmountPaid > totalDueWithDiscounts) { 0 } else { totalDueWithDiscounts - newAmountPaid };

        let updatedInvoice : Invoice = {
          id = invoice.id;
          customerId = invoice.customerId;
          items = invoice.items;
          amountPaid = newAmountPaid;
          amountDue = newAmountDue;
          isPaid = newAmountDue == 0;
          beforePhotos = invoice.beforePhotos;
          afterPhotos = invoice.afterPhotos;
          createdAt = invoice.createdAt;
        };

        invoiceStore.add(invoiceId, updatedInvoice);
        true;
      };
    };
  };

  public query ({ caller }) func getInvoice(id : InvoiceId) : async ?Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoiceStore.get(id);
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view invoices");
    };
    invoiceStore.values().toArray();
  };

  public shared ({ caller }) func addInvoicePhoto(invoiceId : InvoiceId, photoId : PhotoId, isBefore : Bool, blobId : Text, filename : ?Text, contentType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photos");
    };

    switch (invoiceStore.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        let photo : Photo = {
          id = photoId;
          blobId;
          filename;
          contentType;
        };
        let updatedInvoice = updatePhotos(invoice, photo, isBefore);
        invoiceStore.add(invoiceId, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func removeInvoicePhoto(invoiceId : InvoiceId, photoId : PhotoId, isBefore : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove photos");
    };

    switch (invoiceStore.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        let updatedInvoice = filterPhotos(invoice, photoId, isBefore);
        invoiceStore.add(invoiceId, updatedInvoice);
      };
    };
  };

  func updatePhotos(invoice : Invoice, photo : Photo, isBefore : Bool) : Invoice {
    if (isBefore) {
      { invoice with beforePhotos = invoice.beforePhotos.concat([photo]) };
    } else { { invoice with afterPhotos = invoice.afterPhotos.concat([photo]) } };
  };

  func filterPhotos(invoice : Invoice, photoId : PhotoId, isBefore : Bool) : Invoice {
    if (isBefore) {
      let filtered = invoice.beforePhotos.filter(func(photo) { photo.id != photoId });
      { invoice with beforePhotos = filtered };
    } else {
      let filtered = invoice.afterPhotos.filter(func(photo) { photo.id != photoId });
      { invoice with afterPhotos = filtered };
    };
  };

  // Work Order APIs
  public shared ({ caller }) func createWorkOrder(input : CreateWorkOrderInput) : async WorkOrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create work orders");
    };

    // Verify the customer exists
    switch (customerStore.get(input.customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (_customer) {
        let workOrderId = nextWorkOrderId;
        nextWorkOrderId += 1;

        let images = switch (input.images) {
          case (null) { [] };
          case (?imgs) { imgs };
        };

        let finalCost = if (input.cost == 0 and input.services.size() > 0) {
          calculateTotalAmountItems(input.services.map(func(s) { { description = "Line"; quantity = 1; unitPrice = 1; discount = 0 } }));
        } else {
          input.cost;
        };

        let workOrder : WorkOrder = {
          id = workOrderId;
          description = input.description;
          customerId = input.customerId;
          services = input.services;
          createdAt = CurTime.now();
          status = input.status;
          notes = input.notes;
          cost = finalCost;
          images;
        };

        workOrderStore.add(workOrderId, workOrder);
        workOrderId;
      };
    };
  };

  public shared ({ caller }) func updateWorkOrder(workOrderId : WorkOrderId, input : UpdateWorkOrderInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update work orders");
    };

    // If customer is changed, verify new customer exists
    switch (customerStore.get(input.customerId)) {
      case (null) { Runtime.trap("Customer not found") };
      case (_customer) {
        switch (workOrderStore.get(workOrderId)) {
          case (null) { Runtime.trap("Work order not found") };
          case (?_existingWorkOrder) {
            let images = switch (input.images) {
              case (null) { [] };
              case (?imgs) { imgs };
            };

            let finalCost = if (input.cost == 0 and input.services.size() > 0) {
              calculateTotalAmountItems(input.services.map(func(s) { { description = "Line"; quantity = 1; unitPrice = 1; discount = 0 } }));
            } else {
              input.cost;
            };

            let updatedWorkOrder : WorkOrder = {
              id = workOrderId;
              description = input.description;
              customerId = input.customerId;
              services = input.services;
              createdAt = CurTime.now();
              status = input.status;
              notes = input.notes;
              cost = finalCost;
              images;
            };

            workOrderStore.add(workOrderId, updatedWorkOrder);
          };
        };
      };
    };
  };

  public shared ({ caller }) func addWorkOrderPhoto(workOrderId : WorkOrderId, photoId : PhotoId, blobId : Text, filename : ?Text, contentType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add photos");
    };

    switch (workOrderStore.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        let photo : Photo = {
          id = photoId;
          blobId;
          filename;
          contentType;
        };
        let updatedImages = workOrder.images.concat([photo]);
        let updatedWorkOrder = { workOrder with images = updatedImages };
        workOrderStore.add(workOrderId, updatedWorkOrder);
      };
    };
  };

  public shared ({ caller }) func updateWorkOrderPhoto(workOrderId : WorkOrderId, photoId : PhotoId, blobId : Text, filename : ?Text, contentType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update photos");
    };

    switch (workOrderStore.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        let photo : Photo = {
          id = photoId;
          blobId;
          filename;
          contentType;
        };
        let updatedImages = workOrder.images.map(func(p) { if (p.id == photoId) { photo } else { p } });
        let updatedWorkOrder = { workOrder with images = updatedImages };
        workOrderStore.add(workOrderId, updatedWorkOrder);
      };
    };
  };

  public shared ({ caller }) func removeWorkOrderPhoto(workOrderId : WorkOrderId, photoId : PhotoId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove photos");
    };

    switch (workOrderStore.get(workOrderId)) {
      case (null) { Runtime.trap("Work order not found") };
      case (?workOrder) {
        let updatedImages = workOrder.images.filter(func(photo) { photo.id != photoId });
        let updatedWorkOrder = { workOrder with images = updatedImages };
        workOrderStore.add(workOrderId, updatedWorkOrder);
      };
    };
  };

  public query ({ caller }) func getWorkOrder(workOrderId : WorkOrderId) : async ?WorkOrder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get work orders");
    };
    workOrderStore.get(workOrderId);
  };

  public shared ({ caller }) func deleteWorkOrder(workOrderId : WorkOrderId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete work orders");
    };
    workOrderStore.remove(workOrderId);
  };

  public query ({ caller }) func listWorkOrders() : async [WorkOrderWithCustomerName] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list work orders");
    };

    let workOrders = workOrderStore.values().toArray();

    workOrders.map(func(workOrder) {
      let customerName = getCustomerName(workOrder.customerId);
      {
        id = workOrder.id;
        description = workOrder.description;
        customerName = customerName;
        message = ?customerName;
        cost = workOrder.cost;
        createdAt = workOrder.createdAt;
        status = workOrder.status;
        notes = workOrder.notes;
        images = workOrder.images;
        services = workOrder.services;
      };
    });
  };

  private func getCustomerName(customerId : CustomerId) : Text {
    switch (customerStore.get(customerId)) {
      case (null) { "Unknown Customer" };
      case (?customer) { customer.name };
    };
  };
};
