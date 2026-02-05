import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { queryKeys } from '@/api/queryKeys';
import { normalizeError } from '@/api/backendClient';
import type { Invoice, InvoiceLineItem, Customer, InvoiceInput } from '@/backend';
import type { InvoiceFormData } from './types';
import { parseCurrency, parsePercent, clampPercent } from './types';

export function useInvoices() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAuthenticated } = useAuthStatus();

  return useQuery<Invoice[]>({
    queryKey: queryKeys.invoices.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isActorFetching && isAuthenticated,
  });
}

export function useInvoice(id: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAuthenticated } = useAuthStatus();

  return useQuery<Invoice | null>({
    queryKey: queryKeys.invoices.detail(id?.toString() || '0'),
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getInvoice(id);
    },
    enabled: !!actor && !isActorFetching && !!id && isAuthenticated,
  });
}

export function useCustomers() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAuthenticated } = useAuthStatus();

  return useQuery<Customer[]>({
    queryKey: queryKeys.customers.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCustomers();
    },
    enabled: !!actor && !isActorFetching && isAuthenticated,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const items: InvoiceLineItem[] = data.items.map((item) => {
        const quantity = BigInt(parseInt(item.quantity) || 0);
        const unitPrice = parseCurrency(item.unitPrice);
        const discountPercent = parsePercent(item.discount || '0');
        
        // Clamp discount percentage to 0-100 range
        const clampedPercent = clampPercent(discountPercent);
        
        return {
          description: item.description,
          quantity,
          unitPrice,
          discount: BigInt(Math.floor(clampedPercent)), // Send as whole number percentage
        };
      });

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

export function useUpdateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: InvoiceFormData }) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const items: InvoiceLineItem[] = data.items.map((item) => {
        const quantity = BigInt(parseInt(item.quantity) || 0);
        const unitPrice = parseCurrency(item.unitPrice);
        const discountPercent = parsePercent(item.discount || '0');
        
        // Clamp discount percentage to 0-100 range
        const clampedPercent = clampPercent(discountPercent);
        
        return {
          description: item.description,
          quantity,
          unitPrice,
          discount: BigInt(Math.floor(clampedPercent)), // Send as whole number percentage
        };
      });

      const input: InvoiceInput = {
        customerId: data.customerId,
        items,
      };

      return actor.updateInvoice(id, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.id.toString()) });
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

export function useAddInvoicePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      photoId,
      isBefore,
      blobId,
      filename,
      contentType,
    }: {
      invoiceId: bigint;
      photoId: string;
      isBefore: boolean;
      blobId: string;
      filename: string | null;
      contentType: string;
    }) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.addInvoicePhoto(invoiceId, photoId, isBefore, blobId, filename, contentType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useRemoveInvoicePhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      photoId,
      isBefore,
    }: {
      invoiceId: bigint;
      photoId: string;
      isBefore: boolean;
    }) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.removeInvoicePhoto(invoiceId, photoId, isBefore);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(variables.invoiceId.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}
