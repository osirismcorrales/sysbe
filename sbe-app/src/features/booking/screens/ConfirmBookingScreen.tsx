import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import { reservationsService } from "../../../api/services/reservationsService";
import { disponibilidadService } from "../../../api/services/disponibilidadService";
import { paymentsService } from "../../../api/services/paymentsService";
import { queryClient } from "../../../api/queryClient";
import { queryKeys } from "../../../api/queryKeys";
import type { Reservation, MetodoPago } from "../../../data/types";
import { formatHora } from "../utils/bookingValidation";

type Props = NativeStackScreenProps<BookingStackParamList, "ConfirmBooking">;

interface MetodoPagoItem {
  id: MetodoPago;
  nombre: string;
  descripcion: string;
  icono: keyof typeof Ionicons.glyphMap;
  badge?: string;
}

const METODOS_PAGO: MetodoPagoItem[] = [
  {
    id: "TRANSFERENCIA",
    nombre: "Transferencia Bancaria",
    descripcion: "Transferí al alias del club con tu DNI",
    icono: "swap-horizontal-outline",
    badge: "Recomendado",
  },
  {
    id: "EFECTIVO",
    nombre: "Efectivo en Caja",
    descripcion: "Aboná en administración del club antes de tu turno",
    icono: "cash-outline",
  },
];

export default function ConfirmBookingScreen({ navigation, route }: Props) {
  const { serviceId, serviceName, date, time, horaInicio, horaFin, price } = route.params;
  const { user, addReservation, updateUser, refreshUser } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMetodo, setSelectedMetodo] = useState<MetodoPago>("TRANSFERENCIA");
  const [puntosInput, setPuntosInput] = useState("0");
  const precioBase = Number.isFinite(Number(price)) ? Number(price) : 0;

  const formattedDate = (() => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  })();

  // Determinar recargo o descuento real según categoría obtenida del backend
  const cat = user.categoriaObj;
  const recargoPct = cat?.recargo != null && cat.recargo > 0 ? cat.recargo : 0;
  const descuentoPct = cat?.descuento != null && cat.descuento > 0 ? cat.descuento : 0;

  let montoVariacion = 0;
  let tipoVariacion: "recargo" | "descuento" | "ninguno" = "ninguno";
  let totalEstimado = precioBase;

  if (recargoPct > 0) {
    tipoVariacion = "recargo";
    montoVariacion = Math.round((precioBase * recargoPct) / 100);
    totalEstimado = precioBase + montoVariacion;
  } else if (descuentoPct > 0) {
    tipoVariacion = "descuento";
    montoVariacion = Math.round((precioBase * descuentoPct) / 100);
    totalEstimado = Math.max(0, precioBase - montoVariacion);
  } else {
    tipoVariacion = "ninguno";
    montoVariacion = 0;
    totalEstimado = precioBase;
  }

  const totalSeguro = Number.isFinite(totalEstimado) ? Math.max(0, totalEstimado) : 0;
  const puntosDisponibles = Number.isFinite(Number(user.puntosAcumulados))
    ? Math.max(0, Math.floor(Number(user.puntosAcumulados)))
    : 0;
  const maxPuntosAplicables = Math.min(puntosDisponibles, Math.floor(totalSeguro));
  const parsedPuntos = Number.parseInt(puntosInput, 10);
  const puntosUsados = Number.isFinite(parsedPuntos) ? Math.max(0, parsedPuntos) : 0;
  const puntosAplicados = Math.min(puntosUsados, maxPuntosAplicables);
  const montoNeto = Math.max(0, totalSeguro - puntosAplicados);

  const handleConfirmReservation = async () => {
    setIsSubmitting(true);
    try {
      // Determinar horaInicio y horaFin en formato HH:mm:ss
      let finalHoraInicio = horaInicio || "";
      let finalHoraFin = horaFin || "";

      if (!finalHoraInicio || !finalHoraFin) {
        const parts = (time || "").split(" - ");
        if (parts.length >= 2) {
          finalHoraInicio = parts[0].trim();
          finalHoraFin = parts[1].trim();
        }
      }

      // Asegurar formato HH:mm:ss
      if (finalHoraInicio.length === 5) finalHoraInicio = `${finalHoraInicio}:00`;
      if (finalHoraFin.length === 5) finalHoraFin = `${finalHoraFin}:00`;

      // 1. RE-VERIFICAR DISPONIBILIDAD ANTES DE ENVIAR LA RESERVA
      try {
        const bloques = await disponibilidadService.consultarDisponibilidad(Number(serviceId), date);
        const horaPrefix = finalHoraInicio.slice(0, 5);
        const bloqueElegido = bloques.find((b) => b.horaInicio.startsWith(horaPrefix));

        if (!bloqueElegido || !bloqueElegido.disponible) {
          Alert.alert(
            "Turno no disponible",
            "La instalación ya no se encuentra disponible en el horario seleccionado. Por favor, selecciona otro turno o fecha."
          );
          setIsSubmitting(false);
          return;
        }
      } catch (dispErr) {
        if (__DEV__) {
          console.warn("[ConfirmBookingScreen] No se pudo reconfirmar disponibilidad:", dispErr);
        }
      }

      // 2. Llamar al endpoint del backend para crear la reserva: POST /api/reservas
      const responseDto = await reservationsService.crearReserva({
        fechaReserva: date,
        horarioInicio: finalHoraInicio,
        horarioFin: finalHoraFin,
        idUsuario: Number(user.id) || 1,
        idInstalacion: Number(serviceId),
      });

      const montoBackend = Number(responseDto.montoReserva);
      const montoAPagar = responseDto.montoReserva != null && Number.isFinite(montoBackend)
        ? montoBackend
        : totalSeguro;
      const puntosUsadosReales = Math.min(puntosAplicados, puntosDisponibles, Math.floor(montoAPagar));
      const montoNetoReal = Math.max(0, montoAPagar - puntosUsadosReales);

      // 3. Crear el pago en el backend: POST /api/pagos
      let pagoExitoso = false;
      let puntosSaldoDevuelto: number | null = null;
      try {
        const pagoCreado = await paymentsService.crearPago({
          idUsuario: Number(user.id) || 1,
          idReserva: responseDto.idReserva,
          tipoPago: "RESERVA",
          montoPago: montoNetoReal,
          puntosUsados: puntosUsadosReales,
          metodoPago: selectedMetodo,
          estadoPago: selectedMetodo === "EFECTIVO" ? "PENDIENTE" : "APROBADO",
        });
        puntosSaldoDevuelto = pagoCreado.puntosSaldoUsuario ?? null;
        pagoExitoso = true;
      } catch (pagoErr: any) {
        if (__DEV__) {
          console.warn("[ConfirmBookingScreen] Error al registrar pago:", pagoErr);
        }
      }

      // 4. Invalidar consultas en caché para refrescar reservas y pagos en las demás pantallas
      queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });

      // 5. Actualizar estado en el contexto local
      const newReservation: Reservation = {
        id: String(responseDto.idReserva),
        serviceId: String(responseDto.idInstalacion),
        serviceName,
        date: responseDto.fechaReserva,
        time: `${formatHora(responseDto.horarioInicio)} - ${formatHora(responseDto.horarioFin)}`,
        price: montoAPagar,
        discount: tipoVariacion === "descuento" ? montoVariacion : 0,
        pointsUsed: puntosUsadosReales,
        pointsEarned: 0,
        status: "reservado",
        createdAt: new Date().toISOString().split("T")[0],
      };

      addReservation(newReservation);
      if (pagoExitoso && puntosUsadosReales > 0) {
        await updateUser({
          puntosAcumulados: puntosSaldoDevuelto ?? Math.max(0, puntosDisponibles - puntosUsadosReales),
        });
        await refreshUser();
      }

      // 6. Notificar confirmación al usuario
      const metodoObj = METODOS_PAGO.find((m) => m.id === selectedMetodo);
      const metodoNombre = metodoObj ? metodoObj.nombre : selectedMetodo;
      const estadoTexto =
        selectedMetodo === "EFECTIVO"
          ? "Estado del pago: Pendiente (a abonar en recepción)"
          : "Estado del pago: Aprobado";

      const alertMessage = pagoExitoso
        ? `${serviceName}\n${formattedDate} · ${time} hs\n\n` +
          `Monto: $${montoNetoReal.toLocaleString("es-AR")}\n` +
          (puntosUsadosReales > 0 ? `Puntos usados: ${puntosUsadosReales}\n` : "") +
          `Medio de pago: ${metodoNombre}\n` +
          `${estadoTexto}\n\n` +
          `Tu turno y comprobante de pago quedaron registrados en el sistema.`
        : `${serviceName}\n${formattedDate} · ${time} hs\n\n` +
          `Tu reserva quedó registrada (#${responseDto.idReserva}).\n` +
          `No se pudo registrar el pago automáticamente. Podrás abonarlo desde la sección Mis Pagos o en recepción.`;

      Alert.alert(
        pagoExitoso ? "¡Reserva y Pago confirmados!" : "¡Reserva confirmada!",
        alertMessage,
        [
          {
            text: "Ver mis reservas",
            onPress: () => {
              navigation.navigate("MyReservations");
            },
          },
          {
            text: "Ver mis pagos",
            onPress: () => {
              (navigation as any).getParent()?.navigate("Pagos");
            },
          },
        ]
      );
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo completar la reserva. Verifique la disponibilidad del turno.";
      Alert.alert("Error al confirmar reserva", serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar reserva</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Tarjeta de resumen de reserva */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="ticket" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.summaryService}>{serviceName}</Text>
          <Text style={styles.summaryDate}>{formattedDate}</Text>
          <View style={styles.summaryTimeBadge}>
            <Ionicons name="time-outline" size={14} color={Colors.primary} />
            <Text style={styles.summaryTimeText}>{time} hs</Text>
          </View>
        </View>

        {/* Detalle de la reserva */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Detalle de la reserva</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Instalación</Text>
            <Text style={styles.detailValue}>{serviceName}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha solicitada</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Horario</Text>
            <Text style={styles.detailValue}>{time} hs</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Usuario solicitante</Text>
            <Text style={styles.detailValue}>{user.name || user.dni || "Socio SBE"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Condición</Text>
            <View style={[styles.badgePill, recargoPct > 0 ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={[styles.badgeText, recargoPct > 0 ? styles.badgeWarningText : styles.badgeSuccessText]}>
                {user.category || (recargoPct > 0 ? "No Socio" : "Socio")}
              </Text>
            </View>
          </View>
        </View>

        {/* Desglose de Arancel y Pagos */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Desglose del pago</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Arancel base</Text>
            <Text style={styles.detailValue}>${precioBase.toLocaleString("es-AR")}</Text>
          </View>

          {tipoVariacion === "recargo" && (
            <View style={styles.detailRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="arrow-up-circle-outline" size={16} color={Colors.warning} />
                <Text style={styles.detailLabel}>Recargo ({recargoPct}%)</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors.warning }]}>
                +${montoVariacion.toLocaleString("es-AR")}
              </Text>
            </View>
          )}

          {tipoVariacion === "descuento" && (
            <View style={styles.detailRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Ionicons name="arrow-down-circle-outline" size={16} color={Colors.success} />
                <Text style={styles.detailLabel}>Descuento aplicado (-{descuentoPct}%)</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors.success }]}>
                -${montoVariacion.toLocaleString("es-AR")}
              </Text>
            </View>
          )}

          {tipoVariacion === "ninguno" && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descuento / Recargo</Text>
              <Text style={[styles.detailValue, { color: Colors.textSecondary }]}>
                Sin descuento
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total a abonar</Text>
            <Text style={styles.totalValue}>
              ${montoNeto.toLocaleString("es-AR")}
            </Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Usar puntos</Text>
          <Text style={styles.paymentMethodSubtitle}>1 punto = $1 · Disponibles: {user.puntosAcumulados || 0}</Text>
          <TextInput
            value={puntosInput}
            onChangeText={(value) => {
              const soloDigitos = value.replace(/\D/g, "");
              const puntos = soloDigitos ? Number.parseInt(soloDigitos, 10) : 0;
              setPuntosInput(String(Math.max(0, Math.min(maxPuntosAplicables, puntos))));
            }}
            keyboardType="number-pad"
            editable={maxPuntosAplicables > 0}
            placeholder="0"
            style={styles.pointsInput}
          />
          <Text style={styles.pointsHint}>Máximo aplicable: {maxPuntosAplicables} puntos</Text>
          {puntosAplicados > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descuento por puntos</Text>
              <Text style={[styles.detailValue, { color: Colors.success }]}>-${puntosAplicados.toLocaleString("es-AR")}</Text>
            </View>
          )}
        </View>

        {/* Selección interactiva de Medios de Pago */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Selecciona el medio de pago</Text>
          <Text style={styles.paymentMethodSubtitle}>
            Elige el medio con el que abonarás tu reserva:
          </Text>

          <View style={styles.metodosContainer}>
            {METODOS_PAGO.map((metodo) => {
              const isSelected = selectedMetodo === metodo.id;
              return (
                <TouchableOpacity
                  key={metodo.id}
                  style={[
                    styles.metodoItem,
                    isSelected && styles.metodoItemSelected,
                  ]}
                  onPress={() => setSelectedMetodo(metodo.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.metodoIconWrap,
                      isSelected && styles.metodoIconWrapSelected,
                    ]}
                  >
                    <Ionicons
                      name={metodo.icono}
                      size={20}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                      <Text
                        style={[
                          styles.metodoNombre,
                          isSelected && styles.metodoNombreSelected,
                        ]}
                      >
                        {metodo.nombre}
                      </Text>
                      {metodo.badge && (
                        <View style={styles.badgePromo}>
                          <Text style={styles.badgePromoText}>{metodo.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.metodoDesc}>{metodo.descripcion}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Aviso de confirmación */}
        <View style={styles.noticeCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.info} />
          <Text style={styles.noticeText}>
            Al confirmar, el turno quedará reservado a tu nombre en SYSBE y el pago se registrará automáticamente en tu historial. Los puntos elegidos se descontarán de tu saldo.
          </Text>
        </View>
      </ScrollView>

      {/* Botón de Confirmación y Pago */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
          onPress={handleConfirmReservation}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.textOnPrimary} />
          ) : (
            <>
              <Ionicons
                name={selectedMetodo === "EFECTIVO" ? "checkmark-circle-outline" : "card-outline"}
                size={22}
                color={Colors.textOnPrimary}
                style={{ marginRight: Spacing.xs }}
              />
              <Text style={styles.confirmBtnText}>
                {selectedMetodo === "EFECTIVO"
                  ? `Reservar y pagar en caja ($${montoNeto.toLocaleString("es-AR")})`
                  : `Confirmar y pagar $${montoNeto.toLocaleString("es-AR")}`}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },

  content: { padding: Spacing.base, paddingBottom: 110 },

  // Summary
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.base,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  summaryService: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  summaryDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textTransform: "capitalize",
    marginBottom: Spacing.sm,
  },
  summaryTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryTransparent,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  summaryTimeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  // Detail Card
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  pointsInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: Typography.fontSize.base,
    marginTop: Spacing.sm,
  },
  pointsHint: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },

  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.base,
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: "#1E40AF",
    lineHeight: 18,
  },

  // Badges
  badgePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  badgeWarning: {
    backgroundColor: Colors.warningLight,
  },
  badgeWarningText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning,
  },
  badgeSuccess: {
    backgroundColor: Colors.successLight,
  },
  badgeSuccessText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
  },

  // Selección de medios de pago
  paymentMethodSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  metodosContainer: {
    gap: Spacing.sm,
  },
  metodoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metodoItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTransparent,
  },
  metodoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metodoIconWrapSelected: {
    backgroundColor: Colors.primaryTransparent,
    borderColor: Colors.primary,
  },
  metodoNombre: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  metodoNombreSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  metodoDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgePromo: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgePromoText: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnAccent,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.base,
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
});
