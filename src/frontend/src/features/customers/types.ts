import type { UpdatedCustomer, GuitarDetails } from '@/backend';

export type Customer = UpdatedCustomer;
export type { GuitarDetails };

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  guitars: GuitarDetails[];
}

export function customerToFormData(customer: Customer): CustomerFormData {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    guitars: customer.guitars || [],
  };
}
