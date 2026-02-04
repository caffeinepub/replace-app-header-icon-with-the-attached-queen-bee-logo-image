import type { Customer } from '../../backend';

export type { Customer };

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function customerToFormData(customer: Customer): CustomerFormData {
  return {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  };
}
