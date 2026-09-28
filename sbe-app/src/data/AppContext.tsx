import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  User,
  Membership,
  PointMovement,
  Reservation,
  Payment,
  Service,
  Promotion,
  ReservationStatus,
  UsuarioResponseDto,
  LoginRequestDto,
} from "./types";
import { mapUsuarioDtoToUser, EMPTY_USER, EMPTY_MEMBERSHIP } from "./types";
import {
  authService,
  userService,
  servicesService,
  reservationsService,
  paymentsService,
  getAuthToken,
} from "../api";

// ── Tipo del contexto ────────────────────────────────────────────────────────

type AppContextType = {
  // Estado
  user: User;
  membership: Membership;
  points: PointMovement[];
  totalPoints: number;
  reservations: Reservation[];
  payments: Payment[];
  services: Service[];
  promotions: Promotion[];
  isLoadingUser: boolean;

  // Acciones
  updateUser: (partial: Partial<User>) => Promise<void>;
  refreshUser: (id?: string | number) => Promise<void>;
  refreshAll: () => Promise<void>;
  addReservation: (reservation: Reservation) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  addPayment: (payment: Payment) => Promise<void>;
  payMembership: () => void;
  addPoints: (movement: PointMovement) => void;
  redeemPromotion: (promoId: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  login: (credentials: LoginRequestDto) => Promise<boolean>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | number>("");
  const [user, setUser] = useState<User>(EMPTY_USER);
  const [membership, setMembership] = useState<Membership>(EMPTY_MEMBERSHIP);
  const [points, setPoints] = useState<PointMovement[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Calcular puntos totales
  const totalPoints = points.reduce((sum, p) => sum + p.amount, 0);

  // Cargar usuario real desde Spring Boot
  const refreshUser = useCallback(async (id?: string | number) => {
    // Si no hay token ni sesión activa, no realizar llamadas protegidas que resulten en 403
    if (!getAuthToken() && !isLoggedIn) {
      return;
    }

    const targetId = id ?? currentUserId;
    if (!targetId) {
      try {
        setIsLoadingUser(true);
        const dto = await userService.getProfile();
        const mapped = mapUsuarioDtoToUser(dto);
        setUser(mapped);
        if (dto.id) setCurrentUserId(dto.id);
      } catch {
        // No hay sesión activa en backend
      } finally {
        setIsLoadingUser(false);
      }
      return;
    }

    setIsLoadingUser(true);
    try {
      const dto = await userService.getById(targetId);
      const mapped = mapUsuarioDtoToUser(dto);
      setUser(mapped);
      if (id) setCurrentUserId(id);
    } catch (err) {
      if (__DEV__) {
        console.warn(`[AppContext] No se pudo cargar usuario ${targetId} del backend:`, err);
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [currentUserId, isLoggedIn]);

  // Cargar servicios, reservas y pagos reales
  const refreshAll = useCallback(async () => {
    if (!getAuthToken() && !isLoggedIn) {
      return;
    }

    await refreshUser(currentUserId);
    try {
      const backendServices = await servicesService.getAll();
      if (Array.isArray(backendServices) && backendServices.length > 0) {
        setServices(backendServices);
      }
    } catch {}

    try {
      const backendReservations = await reservationsService.getAll();
      if (Array.isArray(backendReservations)) {
        setReservations(backendReservations);
      }
    } catch {}

    try {
      const backendPayments = await paymentsService.getAll();
      if (Array.isArray(backendPayments)) {
        setPayments(backendPayments);
      }
    } catch {}
  }, [currentUserId, isLoggedIn, refreshUser]);

  // Cargar información real únicamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isLoggedIn || Boolean(getAuthToken())) {
      refreshAll();
    }
  }, [isLoggedIn, refreshAll]);

  // Actualizar usuario en backend: PUT /api/usuarios/me
  const updateUser = useCallback(async (partial: Partial<User>) => {
    // Actualización optimista local
    setUser((prev) => ({ ...prev, ...partial }));

    try {
      const parts = (partial.name || "").trim().split(" ");
      const dto = await userService.updateMe({
        nombre: parts[0] || undefined,
        apellido: parts.slice(1).join(" ") || undefined,
        name: partial.name,
        email: partial.email,
        telefono: partial.phone,
        phone: partial.phone,
      });
      setUser(mapUsuarioDtoToUser(dto));
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al guardar en backend PUT /usuarios/me:", err);
      }
      throw err;
    }
  }, []);

  const addReservation = useCallback(async (reservation: Reservation) => {
    // Actualización local
    setReservations((prev) => [reservation, ...prev]);

    // Sumar puntos ganados
    if (reservation.pointsEarned > 0) {
      const pointMovement: PointMovement = {
        id: `pt-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: `Reserva ${reservation.serviceName}`,
        amount: reservation.pointsEarned,
      };
      setPoints((prev) => [pointMovement, ...prev]);
    }

    try {
      await reservationsService.create(reservation);
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al crear reserva en backend:", err);
      }
    }
  }, []);

  const cancelReservation = useCallback(async (id: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.pointsUsed > 0) {
          const refundMovement: PointMovement = {
            id: `pt-${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            description: `Devolución: ${r.serviceName}`,
            amount: r.pointsUsed,
          };
          setPoints((pp) => [refundMovement, ...pp]);
        }
        if (r.pointsEarned > 0) {
          const deductMovement: PointMovement = {
            id: `pt-${Date.now() + 1}`,
            date: new Date().toISOString().split("T")[0],
            description: `Cancelación: ${r.serviceName}`,
            amount: -r.pointsEarned,
          };
          setPoints((pp) => [deductMovement, ...pp]);
        }
        return { ...r, status: "cancelado" as ReservationStatus };
      })
    );

    try {
      await reservationsService.cancel(id);
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al cancelar reserva en backend:", err);
      }
    }
  }, []);

  const addPayment = useCallback(async (payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
    try {
      await paymentsService.create(payment);
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al guardar pago en backend:", err);
      }
    }
  }, []);

  const payMembership = useCallback(async () => {
    setMembership((prev) => ({ ...prev, isPaid: true }));
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      concept: "cuota",
      description: `Cuota mensual — ${new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`,
      amount: membership.monthlyFee,
      date: new Date().toISOString().split("T")[0],
      status: "aprobado",
    };
    setPayments((prev) => [payment, ...prev]);

    const pointMovement: PointMovement = {
      id: `pt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: "Pago de cuota mensual",
      amount: 100,
    };
    setPoints((prev) => [pointMovement, ...prev]);

    try {
      await paymentsService.payMembership();
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al registrar pago de membresía en backend:", err);
      }
    }
  }, [membership.monthlyFee]);

  const addPoints = useCallback((movement: PointMovement) => {
    setPoints((prev) => [movement, ...prev]);
  }, []);

  const redeemPromotion = useCallback((promoId: string) => {
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo || !promo.active) return;
    if (totalPoints < promo.pointsCost) return;

    const movement: PointMovement = {
      id: `pt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: `Canje: ${promo.title}`,
      amount: -promo.pointsCost,
    };
    setPoints((prev) => [movement, ...prev]);
  }, [promotions, totalPoints]);

  const login = useCallback(
    async (credentials: LoginRequestDto): Promise<boolean> => {
      const response = await authService.login(credentials);
      setIsLoggedIn(true);

      const rawUser = response.usuario || response.user;
      let targetUserId = response.id ?? response.userId ?? response.usuarioId;

      // 1. Si el objeto usuario ya viene en la respuesta del login
      if (rawUser) {
        const mapped = mapUsuarioDtoToUser(rawUser);
        setUser(mapped);
        if (rawUser.id) {
          setCurrentUserId(rawUser.id);
          targetUserId = rawUser.id;
        }
      } else if (response.nombre || response.name) {
        // Los datos del usuario vienen en la raíz de response
        const mapped = mapUsuarioDtoToUser(response as any);
        setUser(mapped);
        if (mapped.id) {
          setCurrentUserId(mapped.id);
          targetUserId = mapped.id;
        }
      } else {
        // 2. Si no vino el objeto en el body, intentar extraer el ID del token JWT
        const token = response.token || response.accessToken || response.jwt;
        if (!targetUserId && token) {
          try {
            const parts = token.split(".");
            if (parts.length === 3) {
              const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
              const decoded = JSON.parse(
                decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
                )
              );
              targetUserId = decoded.id ?? decoded.userId ?? decoded.sub;
            }
          } catch {}
        }

        // 3. Consultar el endpoint de Spring Boot: GET /api/usuarios/{id}
        if (targetUserId) {
          try {
            setCurrentUserId(targetUserId);
            const dto = await userService.getById(targetUserId);
            setUser(mapUsuarioDtoToUser(dto));
          } catch {
            try {
              const profile = await userService.getProfile();
              setUser(mapUsuarioDtoToUser(profile));
              if (profile.id) setCurrentUserId(profile.id);
            } catch {}
          }
        } else {
          try {
            const profile = await userService.getProfile();
            setUser(mapUsuarioDtoToUser(profile));
            if (profile.id) setCurrentUserId(profile.id);
          } catch {}
        }
      }

      // Asegurar que el DNI ingresado quede asociado
      setUser((prev) => ({
        ...prev,
        dni: prev.dni || credentials.dni,
      }));

      // 4. Cargar datos protegidos del usuario desde el backend
      try {
        const backendReservations = await reservationsService.getAll();
        if (Array.isArray(backendReservations)) {
          setReservations(backendReservations);
        }
      } catch {}

      try {
        const backendServices = await servicesService.getAll();
        if (Array.isArray(backendServices) && backendServices.length > 0) {
          setServices(backendServices);
        }
      } catch {}

      try {
        const backendPayments = await paymentsService.getAll();
        if (Array.isArray(backendPayments)) {
          setPayments(backendPayments);
        }
      } catch {}

      return true;
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoggedIn(false);
    setUser(EMPTY_USER);
    setMembership(EMPTY_MEMBERSHIP);
    setPoints([]);
    setReservations([]);
    setPayments([]);
    setServices([]);
    setPromotions([]);
    setCurrentUserId("");
    try {
      await authService.logout();
    } catch {}
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        membership,
        points,
        totalPoints,
        reservations,
        payments,
        services,
        promotions,
        isLoadingUser,
        updateUser,
        refreshUser,
        refreshAll,
        addReservation,
        cancelReservation,
        addPayment,
        payMembership,
        addPoints,
        redeemPromotion,
        logout,
        isLoggedIn,
        login,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ── Hook de acceso ───────────────────────────────────────────────────────────

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
