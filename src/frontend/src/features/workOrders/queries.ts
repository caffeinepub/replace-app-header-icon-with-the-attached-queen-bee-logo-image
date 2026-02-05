import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { queryKeys } from '@/api/queryKeys';
import { normalizeError } from '@/api/backendClient';
import type { WorkOrder, WorkOrderWithCustomerName, Customer } from '@/backend';
import type { WorkOrderFormData } from './types';
import { formDataToCreateInput, formDataToUpdateInput } from './types';

export function useWorkOrders() {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAuthenticated } = useAuthStatus();

  return useQuery<WorkOrderWithCustomerName[]>({
    queryKey: queryKeys.workOrders.all,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listWorkOrders();
    },
    enabled: !!actor && !isActorFetching && isAuthenticated,
  });
}

export function useWorkOrder(id: bigint | null) {
  const { actor, isFetching: isActorFetching } = useActor();
  const { isAuthenticated } = useAuthStatus();

  return useQuery<WorkOrder | null>({
    queryKey: queryKeys.workOrders.detail(id?.toString() || '0'),
    queryFn: async () => {
      if (!actor || !id) return null;
      return actor.getWorkOrder(id);
    },
    enabled: !!actor && !isActorFetching && !!id && isAuthenticated,
  });
}

export function useCustomersForWorkOrders() {
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

export function useCreateWorkOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: WorkOrderFormData) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const input = formDataToCreateInput(data);
      return actor.createWorkOrder(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders.all });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useUpdateWorkOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: bigint; data: WorkOrderFormData }) => {
      if (!actor) throw new Error('Backend not initialized');
      
      const input = formDataToUpdateInput(data);
      return actor.updateWorkOrder(id, input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders.detail(variables.id.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useAddWorkOrderPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      photoId,
      blobId,
      filename,
      contentType,
    }: {
      workOrderId: bigint;
      photoId: string;
      blobId: string;
      filename: string | null;
      contentType: string;
    }) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.addWorkOrderPhoto(workOrderId, photoId, blobId, filename, contentType);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders.detail(variables.workOrderId.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}

export function useRemoveWorkOrderPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      photoId,
    }: {
      workOrderId: bigint;
      photoId: string;
    }) => {
      if (!actor) throw new Error('Backend not initialized');
      return actor.removeWorkOrderPhoto(workOrderId, photoId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workOrders.detail(variables.workOrderId.toString()) });
    },
    onError: (error) => {
      throw new Error(normalizeError(error));
    },
  });
}
