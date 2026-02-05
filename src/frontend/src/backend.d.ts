import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type ServiceId = bigint;
export interface UserProfile {
    name: string;
}
export type PhotoId = string;
export interface InvoiceInput {
    customerId: CustomerId;
    items: Array<InvoiceLineItem>;
}
export type Email = string;
export type Discount = bigint;
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
    isPaid: boolean;
    amountPaid: bigint;
    customerId: CustomerId;
    amountDue: bigint;
    items: Array<InvoiceLineItem>;
}
export type Description = string;
export interface Customer {
    id: CustomerId;
    name: Name;
    email: Email;
    address: Address;
    phone: PhoneNumber;
}
export type Price = bigint;
export type PhoneNumber = string;
export interface CustomerInput {
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
export interface BulkImportResult {
    id?: bigint;
    service?: Service;
    message?: string;
    isSuccess: boolean;
    input?: CreateServiceInput;
}
export type CustomerId = bigint;
export type Quantity = bigint;
export type InvoiceId = bigint;
export type Address = string;
export interface InvoiceLineItem {
    description: Description;
    discount: Discount;
    quantity: Quantity;
    unitPrice: Price;
}
export interface Photo {
    id: PhotoId;
    contentType: string;
    filename?: string;
    blobId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCustomer(name: string, phone: PhoneNumber, address: Address, email: Email): Promise<CustomerId>;
    addInvoicePhoto(invoiceId: InvoiceId, photoId: PhotoId, isBefore: boolean, blobId: string, filename: string | null, contentType: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bulkImportServices(services: Array<CreateServiceInput>): Promise<Array<BulkImportResult>>;
    createInvoice(customerId: CustomerId, items: Array<InvoiceLineItem>): Promise<InvoiceId>;
    createService(input: CreateServiceInput): Promise<ServiceId>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCustomer(id: CustomerId): Promise<Customer | null>;
    getInvoice(id: InvoiceId): Promise<Invoice | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listServices(): Promise<Array<Service>>;
    recordPayment(invoiceId: InvoiceId, paymentAmount: bigint): Promise<boolean>;
    removeInvoicePhoto(invoiceId: InvoiceId, photoId: PhotoId, isBefore: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateCustomer(id: CustomerId, input: CustomerInput): Promise<void>;
    updateInvoice(id: InvoiceId, input: InvoiceInput): Promise<void>;
    updateService(serviceId: ServiceId, input: CreateServiceInput): Promise<void>;
}
