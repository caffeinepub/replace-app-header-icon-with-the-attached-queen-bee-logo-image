import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type PhoneNumber = string;
export type Email = string;
export type Address = string;
export type CustomerId = bigint;
export type Quantity = bigint;
export type InvoiceId = bigint;
export type Description = string;
export type Name = string;
export interface Invoice {
    id: InvoiceId;
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
export interface InvoiceLineItem {
    description: Description;
    quantity: Quantity;
    unitPrice: Price;
}
export type Price = bigint;
export interface backendInterface {
    addCustomer(name: string, phone: PhoneNumber, address: Address, email: Email): Promise<CustomerId>;
    createInvoice(customerId: CustomerId, items: Array<InvoiceLineItem>): Promise<InvoiceId>;
    getAllCustomers(): Promise<Array<Customer>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getCustomer(id: CustomerId): Promise<Customer | null>;
    getInvoice(id: InvoiceId): Promise<Invoice | null>;
    recordPayment(invoiceId: InvoiceId, paymentAmount: bigint): Promise<boolean>;
}
