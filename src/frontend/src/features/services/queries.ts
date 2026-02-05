import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/api/queryKeys';
import { createAppError, isStoppedCanisterError } from '@/api/backendClient';
import type { Service, CreateServiceInput, BulkImportResult } from '@/backend';
import type { ServiceFormData } from './types';

export function useServices() {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Service[], Error>({
    queryKey: queryKeys.services.all,
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.listServices();
      } catch (error) {
        throw createAppError(error);
      }
    },
    enabled: !!actor && !isActorFetching,
    retry: (failureCount, error) => {
      // Only retry for stopped-canister errors, up to 3 times
      if (isStoppedCanisterError(error)) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 4000);
    },
  });
}

export function useServiceDetail(serviceId: string) {
  const { actor, isFetching: isActorFetching } = useActor();

  return useQuery<Service | null, Error>({
    queryKey: queryKeys.services.detail(serviceId),
    queryFn: async () => {
      if (!actor) return null;
      try {
        const services = await actor.listServices();
        const service = services.find((s) => s.id.toString() === serviceId);
        return service || null;
      } catch (error) {
        throw createAppError(error);
      }
    },
    enabled: !!actor && !isActorFetching,
    retry: false,
  });
}

export function useCreateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ServiceFormData) => {
      if (!actor) throw new Error('Backend not initialized');
      try {
        const input: CreateServiceInput = {
          name: data.name,
          serviceType: data.serviceType || undefined,
          price: data.priceCents || undefined,
          service: data.service || undefined,
          notes: data.notes || undefined,
        };
        return await actor.createService(input);
      } catch (error) {
        throw createAppError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, data }: { serviceId: string; data: ServiceFormData }) => {
      if (!actor) throw new Error('Backend not initialized');
      try {
        const input: CreateServiceInput = {
          name: data.name,
          serviceType: data.serviceType || undefined,
          price: data.priceCents || undefined,
          service: data.service || undefined,
          notes: data.notes || undefined,
        };
        await actor.updateService(BigInt(serviceId), input);
      } catch (error) {
        throw createAppError(error);
      }
    },
    onSuccess: (_, { serviceId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.services.detail(serviceId) });
    },
  });
}

export function useBulkImportServices() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<BulkImportResult[], Error, CreateServiceInput[]>({
    mutationFn: async (services: CreateServiceInput[]) => {
      if (!actor) throw new Error('Backend not initialized');
      try {
        return await actor.bulkImportServices(services);
      } catch (error) {
        throw createAppError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}
