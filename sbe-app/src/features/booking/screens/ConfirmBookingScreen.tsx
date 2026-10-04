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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import { reservationsService } from "../../../api/services/reservationsService";
import { disponibilidadService } from "../../../api/services/disponibilidadService";
import type { Reservation } from "../../../data/types";
import { formatHora } from "../utils/bookingValidation";

type Props = NativeStackScreenProps<BookingStackParamList, "ConfirmBooking">;

export default function ConfirmBookingScreen({ navigation, route }: Props) {
  const { serviceId, serviceName, date, time, horaInicio, horaFin, price } = route.params;
  const { user, addReservation } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formattedDate = (() => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  })();

  // Determinar condición de socio y cálculo exacto según reglas de negocio
  const tipoSocio = (user.categoriaObj?.tipoSocio || "").toUpperCase();
  const isNoSocio = tipoSocio === "NO_SOCIO" || user.category === "No Socio" || !tipoSocio;
  const isSocioInterno = tipoSocio === "SOCIO_INTERNO" || user.category.includes("Interno");
  const porcentaje = user.categoriaObj?.descuento ?? (isNoSocio ? 15 : isSocioInterno ? 20 : 0);

  const montoVariacion = Math.round((price * porcentaje) / 100);
  let totalEstimado = price;
  if (isNoSocio) {
    totalEstimado = price + montoVariacion; // Recargo para No Socio
  } else if (isSocioInterno) {
    totalEstimado = Math.max(0, price - montoVariacion); // Descuento para Socio Interno
  } else {
    totalEstimado = price; // Tarifa regular para Socio Externo
  }

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

      // 2. Llamar al endpoint del backend: POST /api/reservas
      const responseDto = await reservationsService.crearReserva({
        fechaReserva: date,
        horarioInicio: finalHoraInicio,
        horarioFin: finalHoraFin,
        idUsuario: Number(user.id) || 1,
        idInstalacion: Number(serviceId),
      });

      // 3. Actualizar estado en el contexto local (sin añadir puntos desde el frontend)
      const newReservation: Reservation = {
        id: String(responseDto.idReserva),
        serviceId: String(responseDto.idInstalacion),
        serviceName,
        date: responseDto.fechaReserva,
        time: `${formatHora(responseDto.horarioInicio)} - ${formatHora(responseDto.horarioFin)}`,
        price: responseDto.montoReserva ?? totalEstimado,
        discount: isSocioInterno ? montoVariacion : 0,
        pointsUsed: 0,
        pointsEarned: 0, // Regla: Los puntos son gestionados exclusivamente por el backend
        status: "reservado",
        createdAt: new Date().toISOString().split("T")[0],
      };

      addReservation(newReservation);

      Alert.alert(
        "¡Reserva confirmada!",
        `${serviceName}\n${formattedDate} · ${time} hs\n\nTu turno quedó registrado correctamente en el sistema.`,
        [
          {
            text: "Ver mis reservas",
            onPress: () => {
              navigation.navigate("MyReservations");
            },
          },
          {
            text: "Ir al inicio",
            onPress: () => {
              navigation.popToTop();
            },
            style: "cancel",
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

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
            <View style={[styles.badgePill, isNoSocio ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={[styles.badgeText, isNoSocio ? styles.badgeWarningText : styles.badgeSuccessText]}>
                {user.category || (isNoSocio ? "No Socio" : "Socio")}
              </Text>
            </View>
          </View>
        </View>

        {/* Desglose de Arancel y Pagos */}
        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>Desglose del pago</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Arancel base</Text>
            <Text style={styles.detailValue}>${price.toLocaleString("es-AR")}</Text>
          </View>

          {isNoSocio && montoVariacion > 0 && (
            <View style={styles.detailRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text style={styles.detailLabel}>Recargo No Socio (+{porcentaje}%)</Text>
              </View>
              <Text style={[styles.detailValue, { color: Colors.warning }]}>
                +${montoVariacion.toLocaleString("es-AR")}
              </Text>
            </View>
          )}

          {isSocioInterno && montoVariacion > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Descuento Socio Interno (-{porcentaje}%)</Text>
              <Text style={[styles.detailValue, { color: Colors.success }]}>
                -${montoVariacion.toLocaleString("es-AR")}
              </Text>
            </View>
          )}

          {!isNoSocio && !isSocioInterno && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tarifa Socio Externo</Text>
              <Text style={styles.detailValue}>Precio regular</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Total a abonar</Text>
            <Text style={styles.totalValue}>
              ${totalEstimado.toLocaleString("es-AR")}
            </Text>
          </View>
        </View>

        {/* Ejemplo de cómo serían los pagos */}
        <View style={styles.paymentExampleCard}>
          <View style={styles.paymentExampleHeader}>
            <Ionicons name="card-outline" size={20} color={Colors.primary} />
            <Text style={styles.paymentExampleTitle}>Ejemplo de opciones de pago</Text>
          </View>
          <Text style={styles.paymentExampleSubtitle}>
            Al confirmar la reserva, disponés de los siguientes canales para realizar el pago:
          </Text>

          <View style={styles.paymentOptionItem}>
            <View style={styles.paymentOptionIconWrap}>
              <Ionicons name="phone-portrait-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentOptionName}>Mercado Pago (Recomendado)</Text>
              <Text style={styles.paymentOptionDesc}>
                Pagá online en 1 pago de ${totalEstimado.toLocaleString("es-AR")} con tarjeta de débito, crédito o dinero en cuenta.
              </Text>
            </View>
          </View>

          <View style={styles.paymentOptionItem}>
            <View style={styles.paymentOptionIconWrap}>
              <Ionicons name="business-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentOptionName}>Transferencia Bancaria</Text>
              <Text style={styles.paymentOptionDesc}>
                Transferí al Alias SYSBE.UNSE.PAGOS y el pago quedará acreditado con tu DNI.
              </Text>
            </View>
          </View>

          <View style={styles.paymentOptionItem}>
            <View style={styles.paymentOptionIconWrap}>
              <Ionicons name="cash-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.paymentOptionName}>Caja / Administración del Club</Text>
              <Text style={styles.paymentOptionDesc}>
                Aboná en efectivo o tarjeta física en recepción antes de comenzar tu turno.
              </Text>
            </View>
          </View>
        </View>

        {/* Aviso de confirmación */}
        <View style={styles.noticeCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.info} />
          <Text style={styles.noticeText}>
            Al confirmar, el turno quedará bloqueado exclusivamente a tu nombre en la base de datos de SYSBE y se registrará en tu historial de pagos.
          </Text>
        </View>
      </ScrollView>

      {/* Botón de Confirmación Directa */}
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
                name="checkmark-circle-outline"
                size={22}
                color={Colors.textOnPrimary}
                style={{ marginRight: Spacing.xs }}
              />
              <Text style={styles.confirmBtnText}>Confirmar reserva</Text>
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

  content: { padding: Spacing.base, paddingBottom: 100 },

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

  // Payment Example Card
  paymentExampleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentExampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  paymentExampleTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  paymentExampleSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 16,
  },
  paymentOptionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  paymentOptionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  paymentOptionName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  paymentOptionDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 1,
    lineHeight: 16,
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
