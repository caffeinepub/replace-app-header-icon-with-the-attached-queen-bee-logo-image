import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';
import { queryKeys } from '@/api/queryKeys';
import { normalizeError } from '@/api/backendClient';
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
        // Normalize backend errors into user-friendly Error objects
        throw new Error(normalizeError(error));
      }
    },
    enabled: !!actor && !isActorFetching,
    retry: false,
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
        throw new Error(normalizeError(error));
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
        throw new Error(normalizeError(error));
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
        throw new Error(normalizeError(error));
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
        throw new Error(normalizeError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all });
    },
  });
}
