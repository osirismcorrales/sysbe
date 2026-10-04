import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import { useDisponibilidad } from "../../../api/hooks/useDisponibilidadQuery";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import type { Reservation, BloqueDto } from "../../../data/types";
import {
  calcMin48h,
  calcMax2Months,
  generateSelectableDays,
  isBloqueWithin48h,
  isBloqueBeyond2Months,
  formatHora,
  getDefaultBookingDate,
} from "../utils/bookingValidation";

type Props = NativeStackScreenProps<BookingStackParamList, "MyReservations">;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  reservado: { label: "Reservado", bg: Colors.errorLight, text: Colors.primary, icon: "ticket" },
  completado: { label: "Completado", bg: Colors.successLight, text: Colors.success, icon: "checkmark-circle" },
  cancelado: { label: "Cancelado", bg: Colors.surfaceElevated, text: Colors.textDisabled, icon: "close-circle" },
  pendiente: { label: "Pendiente", bg: Colors.warningLight, text: Colors.warning, icon: "alert-circle" },
};

type Filter = "activas" | "pasadas";

export default function MyReservationsScreen({ navigation }: Props) {
  const { reservations, cancelReservation, reprogramReservation, refreshAll } = useApp();
  const [filter, setFilter] = useState<Filter>("activas");

  // Estado para reprogramación
  const [reprogramTarget, setReprogramTarget] = useState<Reservation | null>(null);
  const [reprogramDate, setReprogramDate] = useState<string>(() => getDefaultBookingDate());
  const [reprogramBloque, setReprogramBloque] = useState<BloqueDto | null>(null);
  const [isSubmittingReprogram, setIsSubmittingReprogram] = useState(false);

  const activeStatuses = ["reservado", "pendiente"];
  const pastStatuses = ["completado", "cancelado"];

  const filtered = reservations.filter((r) =>
    filter === "activas"
      ? activeStatuses.includes(r.status)
      : pastStatuses.includes(r.status)
  );

  const canCancelOrReprogram = (dateStr: string, timeStr?: string): boolean => {
    const min48h = calcMin48h();
    const hora = timeStr ? timeStr.split(" - ")[0] : "00:00";
    return !isBloqueWithin48h(dateStr, hora, min48h);
  };

  const handleCancel = (id: string, serviceName: string) => {
    Alert.alert(
      "Cancelar reserva",
      `¿Estás seguro que deseas cancelar tu turno para "${serviceName}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelReservation(id);
              Alert.alert("Reserva cancelada", "Tu turno ha sido cancelado con éxito.");
            } catch (err: any) {
              Alert.alert("Error al cancelar", err?.message || "No se pudo cancelar la reserva.");
            }
          },
        },
      ]
    );
  };

  // Selector de días para reprogramación
  const selectableDays = useMemo(() => generateSelectableDays(65), []);
  const min48h = useMemo(() => calcMin48h(), [reprogramDate]);
  const max2m = useMemo(() => calcMax2Months(), [reprogramDate]);

  // Consulta de disponibilidad para la instalación que se desea reprogramar
  const {
    data: bloquesDisponibles,
    isLoading: isLoadingBloques,
    error: errorBloques,
    refetch: refetchBloques,
  } = useDisponibilidad(reprogramTarget?.serviceId, reprogramDate);

  const handleOpenReprogram = (r: Reservation) => {
    setReprogramTarget(r);
    setReprogramDate(getDefaultBookingDate());
    setReprogramBloque(null);
  };

  const handleCloseReprogram = () => {
    setReprogramTarget(null);
    setReprogramBloque(null);
    setIsSubmittingReprogram(false);
  };

  const handleConfirmReprogram = async () => {
    if (!reprogramTarget || !reprogramBloque || !reprogramDate) return;

    setIsSubmittingReprogram(true);
    try {
      await reprogramReservation(
        reprogramTarget.id,
        reprogramDate,
        formatHora(reprogramBloque.horaInicio),
        formatHora(reprogramBloque.horaFin)
      );

      handleCloseReprogram();
      Alert.alert(
        "¡Reserva reprogramada!",
        `Tu nuevo horario para ${reprogramTarget.serviceName} es el ${reprogramDate} de ${formatHora(
          reprogramBloque.horaInicio
        )} a ${formatHora(reprogramBloque.horaFin)} hs.`
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo reprogramar la reserva en este horario.";
      Alert.alert("Error al reprogramar", msg);
    } finally {
      setIsSubmittingReprogram(false);
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
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <TouchableOpacity
          onPress={() => refreshAll()}
          style={styles.refreshBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "activas" && styles.filterTabActive]}
          onPress={() => setFilter("activas")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === "activas" && styles.filterTextActive]}>
            Activas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "pasadas" && styles.filterTabActive]}
          onPress={() => setFilter("pasadas")}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterText, filter === "pasadas" && styles.filterTextActive]}>
            Pasadas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.base, paddingBottom: Spacing["3xl"] }}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={54} color={Colors.textDisabled} />
            <Text style={styles.emptyTitle}>
              No hay reservas {filter === "activas" ? "activas" : "pasadas"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === "activas"
                ? "Tus próximos turnos confirmados aparecerán aquí."
                : "Aquí verás el historial de reservas completadas y canceladas."}
            </Text>
          </View>
        ) : (
          filtered.map((r) => {
            const config = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pendiente;
            const dateStr = new Date(r.date + "T12:00:00").toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            const isEligible = r.status === "reservado" && canCancelOrReprogram(r.date, r.time);

            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIconWrap}>
                    <Ionicons name={config.icon} size={24} color={config.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardService}>{r.serviceName}</Text>
                    <Text style={styles.cardDate}>
                      {dateStr} · {r.time} hs
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                    <Text style={[styles.statusText, { color: config.text }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardBottom}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Arancel</Text>
                    <Text style={styles.priceValue}>
                      ${r.price.toLocaleString("es-AR")}
                    </Text>
                  </View>
                </View>

                {/* Acciones */}
                {filter === "activas" && (
                  <View style={styles.actionsContainer}>
                    {isEligible ? (
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          style={styles.reprogramBtn}
                          onPress={() => handleOpenReprogram(r)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="calendar-outline" size={15} color={Colors.primary} />
                          <Text style={styles.reprogramBtnText}>Reprogramar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => handleCancel(r.id, r.serviceName)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle-outline" size={15} color={Colors.error} />
                          <Text style={styles.cancelBtnText}>Cancelar</Text>
                        </TouchableOpacity>
                      </View>
                    ) : r.status === "reservado" ? (
                      <Text style={styles.noCancelHint}>
                        Turno fijado (menos de 48 hs de anticipación)
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal de Reprogramación */}
      <Modal
        visible={reprogramTarget !== null}
        animationType="slide"
        transparent
        onRequestClose={handleCloseReprogram}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Reprogramar turno</Text>
                <Text style={styles.modalSubtitle}>
                  {reprogramTarget?.serviceName}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCloseReprogram} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Aviso 48h y 2 meses */}
              <View style={styles.reprogramNotice}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                <Text style={styles.reprogramNoticeText}>
                  Selecciona una nueva fecha (mínimo 48h y máximo 2 meses exactos).
                </Text>
              </View>

              {/* Selector de Fecha Horizontal */}
              <Text style={styles.reprogramSectionLabel}>Nueva fecha:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reprogramDaysStrip}
              >
                {selectableDays.map((day) => {
                  const isDaySelected = reprogramDate === day.iso;
                  const isBlocked = day.isFullyPastOrUnder48h || day.isBeyondMax;

                  return (
                    <TouchableOpacity
                      key={day.iso}
                      onPress={() => {
                        setReprogramDate(day.iso);
                        setReprogramBloque(null);
                      }}
                      disabled={isBlocked}
                      activeOpacity={0.8}
                      style={[
                        styles.reprogramDayItem,
                        isDaySelected && styles.reprogramDayItemActive,
                        isBlocked && styles.reprogramDayItemDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.reprogramDayName,
                          isDaySelected && styles.reprogramDayNameActive,
                          isBlocked && styles.reprogramDayNameDisabled,
                        ]}
                      >
                        {day.dayName}
                      </Text>
                      <Text
                        style={[
                          styles.reprogramDayNum,
                          isDaySelected && styles.reprogramDayNumActive,
                          isBlocked && styles.reprogramDayNumDisabled,
                        ]}
                      >
                        {day.dayNum}
                      </Text>
                      <Text
                        style={[
                          styles.reprogramDayMonth,
                          isDaySelected && styles.reprogramDayMonthActive,
                          isBlocked && styles.reprogramDayMonthDisabled,
                        ]}
                      >
                        {day.monthName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Bloques de Horarios */}
              <Text style={[styles.reprogramSectionLabel, { marginTop: Spacing.md }]}>
                Nuevos horarios disponibles:
              </Text>

              {isLoadingBloques ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.modalLoadingText}>Consultando turnos...</Text>
                </View>
              ) : errorBloques ? (
                <View style={styles.modalError}>
                  <Text style={styles.modalErrorText}>
                    No se pudieron cargar los turnos para esta fecha.
                  </Text>
                  <TouchableOpacity onPress={() => refetchBloques()} style={styles.modalRetryBtn}>
                    <Text style={styles.modalRetryBtnText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : !bloquesDisponibles || bloquesDisponibles.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Ionicons name="calendar-clear-outline" size={28} color={Colors.textDisabled} />
                  <Text style={styles.modalEmptyText}>
                    Sin horarios disponibles para este día
                  </Text>
                </View>
              ) : (
                <View style={styles.reprogramGrid}>
                  {bloquesDisponibles.map((bloque, index) => {
                    const isWithin48 = isBloqueWithin48h(
                      reprogramDate,
                      bloque.horaInicio,
                      min48h
                    );
                    const isBeyond2M = isBloqueBeyond2Months(
                      reprogramDate,
                      bloque.horaInicio,
                      max2m
                    );
                    const isSelectable = bloque.disponible && !isWithin48 && !isBeyond2M;
                    const isSelected =
                      reprogramBloque !== null &&
                      reprogramBloque.horaInicio === bloque.horaInicio &&
                      reprogramBloque.horaFin === bloque.horaFin;

                    const timeLabel = `${formatHora(bloque.horaInicio)} - ${formatHora(
                      bloque.horaFin
                    )}`;

                    return (
                      <TouchableOpacity
                        key={`${bloque.horaInicio}-${index}`}
                        onPress={() => {
                          if (isSelectable) setReprogramBloque(bloque);
                        }}
                        disabled={!isSelectable}
                        activeOpacity={0.8}
                        style={[
                          styles.reprogramBloqueBtn,
                          isSelectable && styles.reprogramBloqueBtnAvailable,
                          isSelected && styles.reprogramBloqueBtnSelected,
                          !isSelectable && styles.reprogramBloqueBtnDisabled,
                        ]}
                      >
                        <Text
                          style={[
                            styles.reprogramBloqueTime,
                            isSelectable && styles.reprogramBloqueTimeAvailable,
                            isSelected && styles.reprogramBloqueTimeSelected,
                            !isSelectable && styles.reprogramBloqueTimeDisabled,
                          ]}
                        >
                          {timeLabel}
                        </Text>
                        <Text
                          style={[
                            styles.reprogramBadge,
                            isSelected
                              ? styles.reprogramBadgeSelected
                              : isWithin48
                              ? styles.reprogramBadgeDisabled
                              : isBeyond2M
                              ? styles.reprogramBadgeDisabled
                              : bloque.disponible
                              ? styles.reprogramBadgeAvailable
                              : styles.reprogramBadgeDisabled,
                          ]}
                        >
                          {isSelected
                            ? "Elegido"
                            : isWithin48
                            ? "< 48h"
                            : isBeyond2M
                            ? "> 2m"
                            : bloque.disponible
                            ? "Libre"
                            : "Ocupado"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Footer Modal */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  (!reprogramBloque || isSubmittingReprogram) && styles.modalConfirmBtnDisabled,
                ]}
                onPress={handleConfirmReprogram}
                disabled={!reprogramBloque || isSubmittingReprogram}
                activeOpacity={0.85}
              >
                {isSubmittingReprogram ? (
                  <ActivityIndicator size="small" color={Colors.textOnPrimary} />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>
                    Confirmar reprogramación
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  refreshBtn: { padding: Spacing.xs },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.surface,
  },
  filterTabActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.textOnPrimary,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
  },
  cardService: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  cardDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: "capitalize",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  priceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  actionsContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  reprogramBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryTransparent,
  },
  reprogramBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  cancelBtnText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  noCancelHint: {
    fontSize: 11,
    color: Colors.textDisabled,
    fontStyle: "italic",
    textAlign: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.base,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },

  reprogramNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: Spacing.xs + 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.sm,
  },
  reprogramNoticeText: {
    fontSize: 11,
    color: "#1E40AF",
    flex: 1,
  },
  reprogramSectionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  reprogramDaysStrip: {
    gap: Spacing.xs,
    paddingVertical: 4,
  },
  reprogramDayItem: {
    width: 50,
    height: 64,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  reprogramDayItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reprogramDayItemDisabled: {
    opacity: 0.4,
    backgroundColor: Colors.slotDisabled,
  },
  reprogramDayName: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  reprogramDayNameActive: { color: Colors.textOnPrimary },
  reprogramDayNameDisabled: { color: Colors.slotDisabledText },
  reprogramDayNum: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginVertical: 1,
  },
  reprogramDayNumActive: { color: Colors.textOnPrimary },
  reprogramDayNumDisabled: { color: Colors.slotDisabledText },
  reprogramDayMonth: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  reprogramDayMonthActive: { color: Colors.textOnPrimary },
  reprogramDayMonthDisabled: { color: Colors.slotDisabledText },

  modalLoading: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    gap: Spacing.xs,
  },
  modalLoadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  modalError: {
    paddingVertical: Spacing.md,
    alignItems: "center",
  },
  modalErrorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
  modalRetryBtn: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  modalRetryBtnText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
  },
  modalEmpty: {
    paddingVertical: Spacing.lg,
    alignItems: "center",
    gap: 4,
  },
  modalEmptyText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  reprogramGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  reprogramBloqueBtn: {
    width: "48%",
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: "center",
  },
  reprogramBloqueBtnAvailable: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  reprogramBloqueBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reprogramBloqueBtnDisabled: {
    backgroundColor: Colors.slotDisabled,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  reprogramBloqueTime: {
    fontSize: 11,
    fontWeight: Typography.fontWeight.bold,
  },
  reprogramBloqueTimeAvailable: { color: Colors.textPrimary },
  reprogramBloqueTimeSelected: { color: Colors.textOnPrimary },
  reprogramBloqueTimeDisabled: { color: Colors.slotDisabledText },
  reprogramBadge: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  reprogramBadgeAvailable: { color: Colors.success },
  reprogramBadgeSelected: { color: Colors.textOnPrimary },
  reprogramBadgeDisabled: { color: Colors.slotDisabledText },

  modalFooter: {
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalConfirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  modalConfirmBtnDisabled: {
    opacity: 0.5,
  },
  modalConfirmBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
