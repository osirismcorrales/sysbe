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

      // Llamar al endpoint del backend: POST /api/reservas
      const responseDto = await reservationsService.crearReserva({
        fechaReserva: date,
        horarioInicio: finalHoraInicio,
        horarioFin: finalHoraFin,
        idUsuario: Number(user.id) || 1,
        idInstalacion: Number(serviceId),
      });

      // Actualizar estado en el contexto local
      const newReservation: Reservation = {
        id: String(responseDto.idReserva),
        serviceId: String(responseDto.idInstalacion),
        serviceName,
        date: responseDto.fechaReserva,
        time: `${formatHora(responseDto.horarioInicio)} - ${formatHora(responseDto.horarioFin)}`,
        price: responseDto.montoReserva ?? price,
        discount: 0,
        pointsUsed: 0,
        pointsEarned: Math.round((responseDto.montoReserva ?? price) / 50) * 10,
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
        {/* Tarjeta de resumen de reserva con mejor icono */}
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

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.totalLabel}>Arancel base</Text>
            <Text style={styles.totalValue}>
              ${price.toLocaleString("es-AR")}
            </Text>
          </View>
        </View>

        {/* Aviso de confirmación */}
        <View style={styles.noticeCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.info} />
          <Text style={styles.noticeText}>
            Al confirmar, el turno quedará bloqueado exclusivamente a tu nombre en la base de datos de SYSBE.
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
  },
  noticeText: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    color: "#1E40AF",
    lineHeight: 18,
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
