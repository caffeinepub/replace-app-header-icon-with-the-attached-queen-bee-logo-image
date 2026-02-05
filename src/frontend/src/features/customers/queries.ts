import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/api/queryKeys';
import { normalizeError } from '@/api/backendClient';
import type { Customer, CustomerInput } from '@/backend';
import type { CustomerFormData } from './types';

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

export function useCustomer(id: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Customer | null>({
    queryKey: queryKeys.customers.detail(id?.toString() || '0'),
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getCustomer(id);
    },
    enabled: !!actor && !isActorFetching && !!id,
  });
}

export function useCreateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.addCustomer(data.name, data.phone, data.address, data.email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useUpdateCustomer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: CustomerFormData }) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const input: CustomerInput = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        email: data.email,
      };
      
      return actor.updateCustomer(id, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.detail(variables.id.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}
