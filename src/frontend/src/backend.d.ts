import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InvoiceInput {
    customerId: CustomerId;
    items: Array<InvoiceLineItem>;
}
export interface UserProfile {
    name: string;
}
export type Address = string;
export type PhotoId = string;
export type WorkOrderId = bigint;
export type Description = string;
export interface CustomerInput {
    name: Name;
    email: Email;
    address: Address;
    phone: PhoneNumber;
}
export interface WorkOrderWithCustomerName {
    id: WorkOrderId;
    customerName: string;
    status: WorkOrderStatus;
    cost: bigint;
    createdAt: bigint;
    description: string;
    message?: string;
    notes?: string;
    services: Array<ServiceId>;
    images: Array<Photo>;
}
export type PhoneNumber = string;
export type Quantity = bigint;
export type Email = string;
export interface Photo {
    id: PhotoId;
    contentType: string;
    filename?: string;
    blobId: string;
}
export type ServiceId = bigint;
export interface UpdateWorkOrderInput {
    status: WorkOrderStatus;
    cost: bigint;
    description: string;
    notes?: string;
    customerId: CustomerId;
    services: Array<ServiceId>;
    images?: Array<Photo>;
}
export type Discount = bigint;
export interface BulkImportResult {
    id?: bigint;
    service?: Service;
    message?: string;
    isSuccess: boolean;
    input?: CreateServiceInput;
}
export interface WorkOrder {
    id: WorkOrderId;
    status: WorkOrderStatus;
    cost: bigint;
    createdAt: bigint;
    description: string;
    notes?: string;
    customerId: CustomerId;
    services: Array<ServiceId>;
    images: Array<Photo>;
}
export interface Service {
    id: ServiceId;
    service?: string;
    serviceType?: string;
    name: string;
    notes?: string;
    price?: bigint;
}
export type Name = string;
export interface Invoice {
    id: InvoiceId;
    beforePhotos: Array<Photo>;
    afterPhotos: Array<Photo>;
    createdAt: bigint;
    isPaid: boolean;
    amountPaid: bigint;
    customerId: CustomerId;
    amountDue: bigint;
    items: Array<InvoiceLineItem>;
}
export interface Customer {
    id: CustomerId;
    name: Name;
    email: Email;
    address: Address;
    phone: PhoneNumber;
}
export interface CreateServiceInput {
    service?: string;
    serviceType?: string;
    name: string;
    notes?: string;
    price?: bigint;
}
export type Price = bigint;
export type CustomerId = bigint;
export type InvoiceId = bigint;
export interface CreateWorkOrderInput {
    status: WorkOrderStatus;
    cost: bigint;
    description: string;
    notes?: string;
    customerId: CustomerId;
    services: Array<ServiceId>;
    images?: Array<Photo>;
}
export interface InvoiceLineItem {
    description: Description;
    discount: Discount;
    quantity: Quantity;
    unitPrice: Price;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum WorkOrderStatus {
    sent_for_approval = "sent_for_approval",
    cancelled = "cancelled",
    pending_payment = "pending_payment",
    in_progress = "in_progress",
    complete = "complete",
    approved = "approved",
    finalized = "finalized"
}
export interface backendInterface {
    addCustomer(name: string, phone: PhoneNumber, address: Address, email: Email): Promise<CustomerId>;
    addInvoicePhoto(invoiceId: InvoiceId, photoId: PhotoId, isBefore: boolean, blobId: string, filename: string | null, contentType: string): Promise<void>;
    addWorkOrderPhoto(workOrderId: WorkOrderId, photoId: PhotoId, blobId: string, filename: string | null, contentType: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportServices(services: Array<CreateServiceInput>): Promise<Array<BulkImportResult>>;
    createInvoice(customerId: CustomerId, items: Array<InvoiceLineItem>): Promise<InvoiceId>;
    createService(input: CreateServiceInput): Promise<ServiceId>;
    createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderId>;
    deleteWorkOrder(workOrderId: WorkOrderId): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: CustomerId): Promise<Customer | null>;
    getInvoice(id: InvoiceId): Promise<Invoice | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWorkOrder(workOrderId: WorkOrderId): Promise<WorkOrder | null>;
    isCallerAdmin(): Promise<boolean>;
    listServices(): Promise<Array<Service>>;
    listWorkOrders(): Promise<Array<WorkOrderWithCustomerName>>;
    recordPayment(invoiceId: InvoiceId, paymentAmount: bigint): Promise<boolean>;
    removeInvoicePhoto(invoiceId: InvoiceId, photoId: PhotoId, isBefore: boolean): Promise<void>;
    removeWorkOrderPhoto(workOrderId: WorkOrderId, photoId: PhotoId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(id: CustomerId, input: CustomerInput): Promise<void>;
    updateInvoice(id: InvoiceId, input: InvoiceInput): Promise<void>;
    updateService(serviceId: ServiceId, input: CreateServiceInput): Promise<void>;
    updateWorkOrder(workOrderId: WorkOrderId, input: UpdateWorkOrderInput): Promise<void>;
    updateWorkOrderPhoto(workOrderId: WorkOrderId, photoId: PhotoId, blobId: string, filename: string | null, contentType: string): Promise<void>;
}
