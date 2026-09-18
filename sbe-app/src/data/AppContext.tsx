import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  User,
  Membership,
  PointMovement,
  Reservation,
  Payment,
  Service,
  Promotion,
  ReservationStatus,
} from "./types";
import {
  MOCK_USER,
  MOCK_MEMBERSHIP,
  MOCK_POINTS,
  MOCK_RESERVATIONS,
  MOCK_PAYMENTS,
  MOCK_SERVICES,
  MOCK_PROMOTIONS,
} from "./mockData";

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

  // Acciones
  updateUser: (partial: Partial<User>) => void;
  addReservation: (reservation: Reservation) => void;
  cancelReservation: (id: string) => void;
  addPayment: (payment: Payment) => void;
  payMembership: () => void;
  addPoints: (movement: PointMovement) => void;
  redeemPromotion: (promoId: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
  login: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(MOCK_USER);
  const [membership, setMembership] = useState<Membership>(MOCK_MEMBERSHIP);
  const [points, setPoints] = useState<PointMovement[]>(MOCK_POINTS);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);
  const [services] = useState<Service[]>(MOCK_SERVICES);
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Calcular puntos totales
  const totalPoints = points.reduce((sum, p) => sum + p.amount, 0);

  const updateUser = useCallback((partial: Partial<User>) => {
    setUser((prev) => ({ ...prev, ...partial }));
  }, []);

  const addReservation = useCallback((reservation: Reservation) => {
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
  }, []);

  const cancelReservation = useCallback((id: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        // Devolver puntos usados
        if (r.pointsUsed > 0) {
          const refundMovement: PointMovement = {
            id: `pt-${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            description: `Devolución: ${r.serviceName}`,
            amount: r.pointsUsed,
          };
          setPoints((pp) => [refundMovement, ...pp]);
        }
        // Restar puntos ganados
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
  }, []);

  const addPayment = useCallback((payment: Payment) => {
    setPayments((prev) => [payment, ...prev]);
  }, []);

  const payMembership = useCallback(() => {
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
    // Sumar puntos por pago de cuota
    const pointMovement: PointMovement = {
      id: `pt-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: "Pago de cuota mensual",
      amount: 100,
    };
    setPoints((prev) => [pointMovement, ...prev]);
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

  const login = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
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
        updateUser,
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
