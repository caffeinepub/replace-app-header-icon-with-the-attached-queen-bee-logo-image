import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/api/queryKeys';
import { createAppError, normalizeError } from '@/api/backendClient';
import type { UpdatedCustomer, CustomerInput, WorkOrder } from '@/backend';
import type { CustomerFormData } from './types';

export type Customer = UpdatedCustomer;

export function useCustomers() {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Customer[], Error>({
    queryKey: queryKeys.customers.all,
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCustomers();
      } catch (error) {
        throw createAppError(error);
      }
    },
    enabled: !!actor && !isActorFetching,
  });
}

export function useCustomer(id: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Customer | null, Error>({
    queryKey: queryKeys.customers.detail(id?.toString() || '0'),
    queryFn: async () => {
      if (!actor || !id) return null;
      try {
        return await actor.getCustomer(id);
      } catch (error) {
        throw createAppError(error);
      }
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
      try {
        const input: CustomerInput = {
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: data.email,
          guitars: data.guitars,
        };
        const customerId = await actor.addCustomer(data.name, data.phone, data.address, data.email);
        await actor.updateCustomer(customerId, input);
        return customerId;
      } catch (error) {
        throw createAppError(error);
      }
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
      
      try {
        const input: CustomerInput = {
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: data.email,
          guitars: data.guitars,
        };
        
        return await actor.updateCustomer(id, input);
      } catch (error) {
        throw createAppError(error);
      }
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

export function useCustomerWorkOrders(customerId: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<{ ongoing: WorkOrder[]; completed: WorkOrder[] }, Error>({
    queryKey: [...queryKeys.customers.detail(customerId?.toString() || '0'), 'workOrders'],
    queryFn: async () => {
      if (!actor || !customerId) return { ongoing: [], completed: [] };
      try {
        const allWorkOrders = await actor.listWorkOrders();
        
        // Filter work orders by matching customerId from the full work order data
        const customerWorkOrdersWithDetails = await Promise.all(
          allWorkOrders
            .filter(wo => wo.id)
            .map(async (wo) => {
              try {
                const fullWorkOrder = await actor.getWorkOrder(wo.id);
                return fullWorkOrder;
              } catch {
                return null;
              }
            })
        );
        
        const customerWorkOrders = customerWorkOrdersWithDetails
          .filter((wo): wo is WorkOrder => 
            wo !== null && 
            wo.customerId.toString() === customerId.toString()
          );
        
        const ongoing = customerWorkOrders.filter(wo => wo.status !== 'complete');
        const completed = customerWorkOrders.filter(wo => wo.status === 'complete');
        
        return { ongoing, completed };
      } catch (error) {
        throw createAppError(error);
      }
    },
    enabled: !!actor && !isActorFetching && !!customerId,
  });
}
