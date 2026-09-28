/**
 * Query Keys Factory para TanStack React Query.
 * Permite manejar las llaves de cache de forma consistente y estructurada,
 * facilitando la invalidación y actualización precisa de queries.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  user: {
    all: ["user"] as const,
    detail: (id: string | number) => [...queryKeys.user.all, "detail", String(id)] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
    membership: () => [...queryKeys.user.all, "membership"] as const,
    points: () => [...queryKeys.user.all, "points"] as const,
  },
  services: {
    all: ["services"] as const,
    list: (category?: string) => [...queryKeys.services.all, "list", { category }] as const,
    detail: (id: string) => [...queryKeys.services.all, "detail", id] as const,
    slots: (id: string, date: string) => [...queryKeys.services.all, "slots", id, date] as const,
  },
  reservations: {
    all: ["reservations"] as const,
    list: (status?: string) => [...queryKeys.reservations.all, "list", { status }] as const,
    detail: (id: string) => [...queryKeys.reservations.all, "detail", id] as const,
  },
  payments: {
    all: ["payments"] as const,
    list: () => [...queryKeys.payments.all, "list"] as const,
    detail: (id: string) => [...queryKeys.payments.all, "detail", id] as const,
  },
  promotions: {
    all: ["promotions"] as const,
    list: () => [...queryKeys.promotions.all, "list"] as const,
  },
} as const;
