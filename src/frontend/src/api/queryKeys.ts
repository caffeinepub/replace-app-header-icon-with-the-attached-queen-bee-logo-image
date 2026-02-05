export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    detail: (id: string) => ['customers', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
  services: {
    all: ['services'] as const,
    detail: (id: string) => ['services', id] as const,
  },
  workOrders: {
    all: ['workOrders'] as const,
    detail: (id: string) => ['workOrders', id] as const,
  },
};
