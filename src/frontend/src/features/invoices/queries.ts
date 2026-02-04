import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/api/queryKeys';
import { normalizeError } from '@/api/backendClient';
import type { Invoice, InvoiceLineItem, Customer } from '@/backend';
import type { InvoiceFormData } from './types';
import { parseCurrency } from './types';

export function useInvoices() {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Invoice[]>({
    queryKey: queryKeys.invoices.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isActorFetching,
  });
}

export function useInvoice(id: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Invoice | null>({
    queryKey: queryKeys.invoices.detail(id?.toString() || '0'),
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isActorFetching && !!id,
  });
}

export function useCustomers() {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Customer[]>({
    queryKey: queryKeys.customers.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isActorFetching,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const items: InvoiceLineItem[] = data.items.map((item) => ({
        description: item.description,
        quantity: BigInt(parseInt(item.quantity) || 0),
        unitPrice: parseCurrency(item.unitPrice),
      }));

      return actor.createInvoice(data.customerId, items);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId, amount }: { invoiceId: bigint; amount: bigint }) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.recordPayment(invoiceId, amount);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}
