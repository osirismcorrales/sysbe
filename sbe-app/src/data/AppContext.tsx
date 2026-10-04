import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  User,
  Membership,
  PointMovement,
  Reservation,
  Payment,
  Service,
  Promotion,
  LoginRequestDto,
  ReservationStatus,
} from "./types";
import { mapUsuarioDtoToUser, mapReservaHistorialToReservation, EMPTY_USER, EMPTY_MEMBERSHIP } from "./types";
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
  refreshUser: () => Promise<void>;
  refreshAll: () => Promise<void>;
  addReservation: (reservation: Reservation) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  reprogramReservation: (
    id: string,
    fechaReserva: string,
    horarioInicio: string,
    horarioFin: string
  ) => Promise<any>;
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

  // Calcular puntos totales a partir de los puntos acumulados del backend (puntosAc) + movimientos locales
  const totalPoints = (user.puntosAcumulados || 0) + points.reduce((sum, p) => sum + p.amount, 0);

  // Cargar usuario real desde Spring Boot: GET /api/usuarios/me
  const refreshUser = useCallback(async () => {
    // Si no hay token ni sesión activa, no realizar llamadas protegidas que resulten en 403
    if (!getAuthToken() && !isLoggedIn) {
      return;
    }

    setIsLoadingUser(true);
    try {
      const dto = await userService.getProfile();
      const mapped = mapUsuarioDtoToUser(dto);
      setUser(mapped);
      if (dto.id) setCurrentUserId(dto.id);
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] No se pudo cargar perfil del usuario:", err);
      }
    } finally {
      setIsLoadingUser(false);
    }
  }, [isLoggedIn]);

  // Cargar servicios, reservas y pagos reales
  const refreshAll = useCallback(async () => {
    if (!getAuthToken() && !isLoggedIn) {
      return;
    }

    await refreshUser();
    try {
      const backendServices = await servicesService.getAll();
      if (Array.isArray(backendServices) && backendServices.length > 0) {
        setServices(backendServices);
      }
    } catch {}

    // Cargar historial de reservas reales del backend: GET /api/reservas/me
    try {
      const backendReservas = await reservationsService.obtenerMisReservas();
      if (Array.isArray(backendReservas)) {
        const mapped: Reservation[] = backendReservas.map(mapReservaHistorialToReservation);
        setReservations(mapped);
      }
    } catch {}
  }, [isLoggedIn, refreshUser]);

  // Cargar información real únicamente cuando el usuario esté autenticado
  useEffect(() => {
    if (isLoggedIn || Boolean(getAuthToken())) {
      refreshAll();
    }
  }, [isLoggedIn, refreshAll]);

  // Actualizar usuario en backend: PUT /api/usuarios/me
  const updateUser = useCallback(async (partial: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  const addReservation = useCallback(async (reservation: Reservation) => {
    setReservations((prev) => [reservation, ...prev]);

    if (reservation.pointsEarned > 0) {
      const pointMovement: PointMovement = {
        id: `pt-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: `Reserva ${reservation.serviceName}`,
        amount: reservation.pointsEarned,
      };
      setPoints((prev) => [pointMovement, ...prev]);
    }
  }, []);

  const cancelReservation = useCallback(async (id: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return { ...r, status: "cancelado" as ReservationStatus };
      })
    );

    try {
      await reservationsService.cancelarReserva(id);
    } catch (err) {
      if (__DEV__) {
        console.warn("[AppContext] Error al cancelar reserva en backend:", err);
      }
    }
  }, []);

  const reprogramReservation = useCallback(
    async (
      id: string,
      fechaReserva: string,
      horarioInicio: string,
      horarioFin: string
    ) => {
      let finalHoraInicio = horarioInicio;
      let finalHoraFin = horarioFin;
      if (finalHoraInicio.length === 5) finalHoraInicio = `${finalHoraInicio}:00`;
      if (finalHoraFin.length === 5) finalHoraFin = `${finalHoraFin}:00`;

      const responseDto = await reservationsService.reprogramarReserva(id, {
        fechaReserva,
        horarioInicio: finalHoraInicio,
        horarioFin: finalHoraFin,
      });

      setReservations((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return {
            ...r,
            date: responseDto.fechaReserva,
            time: `${responseDto.horarioInicio.slice(0, 5)} - ${responseDto.horarioFin.slice(0, 5)}`,
            status: "reservado",
          };
        })
      );

      return responseDto;
    },
    []
  );

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
      // 1. Autenticación: obtener token JWT
      await authService.login(credentials);
      setIsLoggedIn(true);

      // 2. Obtener perfil del usuario autenticado: GET /api/usuarios/me
      try {
        const profile = await userService.getProfile();
        const mapped = mapUsuarioDtoToUser(profile);
        setUser(mapped);
        if (profile.id) setCurrentUserId(profile.id);
      } catch {
        // Si /usuarios/me falla, al menos guardar el DNI ingresado
        setUser((prev) => ({
          ...prev,
          dni: credentials.dni,
        }));
      }

      // 3. Cargar instalaciones disponibles desde el backend: GET /api/instalaciones
      try {
        const backendServices = await servicesService.getAll();
        if (Array.isArray(backendServices) && backendServices.length > 0) {
          setServices(backendServices);
        }
      } catch {}

      return true;
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(EMPTY_USER);
    setMembership(EMPTY_MEMBERSHIP);
    setPoints([]);
    setReservations([]);
    setPayments([]);
    setServices([]);
    setPromotions([]);
    setCurrentUserId("");
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
        reprogramReservation,
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
