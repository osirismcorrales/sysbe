import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useServices } from "../../../api/hooks/useServicesQuery";
import { useDisponibilidad } from "../../../api/hooks/useDisponibilidadQuery";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import type { Service, BloqueDto } from "../../../data/types";
import {
  calcMin48h,
  calcMax2Months,
  generateSelectableDays,
  isBloqueWithin48h,
  isBloqueBeyond2Months,
  formatHora,
  getDefaultBookingDate,
} from "../utils/bookingValidation";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<BookingStackParamList, "BookService">;

export default function BookScreen({ navigation }: Props) {
  const { data: services, isLoading, isFetching, refetch, error } = useServices();

  // Instalación seleccionada
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Fecha seleccionada (por defecto hoy + 2 días para cumplir las 48h)
  const [selectedDate, setSelectedDate] = useState<string>(() => getDefaultBookingDate());

  // Bloque horario seleccionado
  const [selectedBloque, setSelectedBloque] = useState<BloqueDto | null>(null);

  // Días generados para el selector horizontal (hasta 65 días para cubrir 2 meses)
  const selectableDays = useMemo(() => generateSelectableDays(65), []);
  const min48h = useMemo(() => calcMin48h(), [selectedDate]);
  const max2m = useMemo(() => calcMax2Months(), [selectedDate]);

  // Si la fecha por defecto cayera en un día totalmente restringido, buscar el primer día válido
  useEffect(() => {
    const firstValidDay = selectableDays.find(
      (d) => !d.isFullyPastOrUnder48h && !d.isBeyondMax
    );
    if (firstValidDay && (!selectedDate || selectedDate < firstValidDay.iso)) {
      setSelectedDate(firstValidDay.iso);
    }
  }, [selectableDays]);

  // Consulta de disponibilidad en tiempo real a la API del backend
  const {
    data: bloques,
    isLoading: isLoadingBloques,
    error: errorBloques,
    refetch: refetchBloques,
  } = useDisponibilidad(selectedServiceId, selectedDate);

  const selectedService = useMemo(() => {
    return services?.find((s) => s.id === selectedServiceId) ?? null;
  }, [services, selectedServiceId]);

  const handleToggleService = (service: Service) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectedServiceId === service.id) {
      // Deseleccionar si ya estaba abierta
      setSelectedServiceId(null);
      setSelectedBloque(null);
    } else {
      setSelectedServiceId(service.id);
      setSelectedBloque(null);
    }
  };

  const handleSelectDate = (isoDate: string, isBlocked: boolean) => {
    if (isBlocked) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedDate(isoDate);
    setSelectedBloque(null);
  };

  const handleSelectBloque = (bloque: BloqueDto, isSelectable: boolean) => {
    if (!isSelectable) return;
    if (
      selectedBloque &&
      selectedBloque.horaInicio === bloque.horaInicio &&
      selectedBloque.horaFin === bloque.horaFin
    ) {
      setSelectedBloque(null);
    } else {
      setSelectedBloque(bloque);
    }
  };

  const handleProceedToBooking = () => {
    if (!selectedService || !selectedBloque || !selectedDate) return;

    const timeFormatted = `${formatHora(selectedBloque.horaInicio)} - ${formatHora(
      selectedBloque.horaFin
    )}`;

    navigation.navigate("ConfirmBooking", {
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      time: timeFormatted,
      horaInicio: formatHora(selectedBloque.horaInicio),
      horaFin: formatHora(selectedBloque.horaFin),
      price: selectedService.price,
    });
  };

  // Formato amigable de la fecha seleccionada
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              refetch();
              if (selectedServiceId && selectedDate) {
                refetchBloques();
              }
            }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Instalaciones</Text>
            <Text style={styles.headerSubtitle}>
              Selecciona una cancha o espacio para ver turnos
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyReservations")}
            style={styles.myReservationsBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="ticket-outline" size={16} color={Colors.primary} />
            <Text style={styles.myReservationsText}>Mis reservas</Text>
          </TouchableOpacity>
        </View>

        {/* Reglas de anticipación (Aviso frontend) */}
        <View style={styles.ruleNotice}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
          <Text style={styles.ruleNoticeText}>
            Reservas con un mínimo de <Text style={styles.ruleNoticeBold}>48 hs corridas</Text>{" "}
            y hasta <Text style={styles.ruleNoticeBold}>2 meses</Text> de anticipación.
          </Text>
        </View>

        {/* Estado de carga general */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando instalaciones...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.errorTitle}>Error al cargar</Text>
            <Text style={styles.errorSubtitle}>
              No se pudieron obtener las instalaciones del servidor.
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-outline" size={16} color={Colors.primary} />
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : !services || services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.emptyTitle}>Sin instalaciones</Text>
            <Text style={styles.emptySubtitle}>
              No hay instalaciones disponibles en este momento.
            </Text>
          </View>
        ) : (
          /* Lista interactiva de instalaciones */
          <View style={styles.serviceList}>
            {services.map((service) => {
              const isSelected = selectedServiceId === service.id;

              return (
                <View
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    isSelected && styles.serviceCardActive,
                  ]}
                >
                  {/* Fila principal de la instalación (Clickable) */}
                  <TouchableOpacity
                    style={styles.serviceCardHeader}
                    onPress={() => handleToggleService(service)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.serviceIconWrap,
                        isSelected && styles.serviceIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color={isSelected ? Colors.textOnPrimary : Colors.primary}
                      />
                    </View>

                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      {service.description ? (
                        <Text style={styles.serviceDescription} numberOfLines={2}>
                          {service.description}
                        </Text>
                      ) : null}

                      <View style={styles.serviceMetaRow}>
                        {/* Precio */}
                        <View style={styles.metaItem}>
                          <Ionicons name="cash-outline" size={14} color={Colors.primary} />
                          <Text style={styles.metaTextPrice}>
                            ${service.price.toLocaleString("es-AR")}
                          </Text>
                        </View>

                        {/* Duración */}
                        {service.durationMinutes > 0 && (
                          <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.metaText}>{service.durationMinutes} min</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Flecha expand/collapse */}
                    <View style={styles.arrowWrap}>
                      <Ionicons
                        name={isSelected ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={isSelected ? Colors.primary : Colors.textDisabled}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Panel expandible de horarios y fechas */}
                  {isSelected && (
                    <View style={styles.expandedPanel}>
                      <View style={styles.panelDivider} />

                      {/* 1. Selector de Fecha */}
                      <View style={styles.sectionHeaderRow}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Selecciona la fecha</Text>
                      </View>
                      <Text style={styles.selectedDateSub}>
                        {formattedSelectedDate}
                      </Text>

                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.daysStrip}
                      >
                        {selectableDays.map((day) => {
                          const isDaySelected = selectedDate === day.iso;
                          const isBlocked = day.isFullyPastOrUnder48h || day.isBeyondMax;

                          return (
                            <TouchableOpacity
                              key={day.iso}
                              onPress={() => handleSelectDate(day.iso, isBlocked)}
                              disabled={isBlocked}
                              activeOpacity={0.8}
                              style={[
                                styles.dayItem,
                                isDaySelected && styles.dayItemActive,
                                isBlocked && styles.dayItemDisabled,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dayName,
                                  isDaySelected && styles.dayNameActive,
                                  isBlocked && styles.dayNameDisabled,
                                ]}
                              >
                                {day.dayName}
                              </Text>
                              <Text
                                style={[
                                  styles.dayNum,
                                  isDaySelected && styles.dayNumActive,
                                  isBlocked && styles.dayNumDisabled,
                                ]}
                              >
                                {day.dayNum}
                              </Text>
                              <Text
                                style={[
                                  styles.dayMonth,
                                  isDaySelected && styles.dayMonthActive,
                                  isBlocked && styles.dayMonthDisabled,
                                ]}
                              >
                                {day.monthName}
                              </Text>
                              {day.isFullyPastOrUnder48h && (
                                <Text style={styles.dayUnder48Tag}>&lt;48h</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      {/* 2. Bloques de Disponibilidad */}
                      <View style={[styles.sectionHeaderRow, { marginTop: Spacing.md }]}>
                        <Ionicons name="time-outline" size={16} color={Colors.primary} />
                        <Text style={styles.sectionTitle}>Horarios disponibles</Text>
                      </View>

                      {isLoadingBloques ? (
                        <View style={styles.bloquesLoading}>
                          <ActivityIndicator size="small" color={Colors.primary} />
                          <Text style={styles.bloquesLoadingText}>
                            Consultando disponibilidad para {formattedSelectedDate}...
                          </Text>
                        </View>
                      ) : errorBloques ? (
                        <View style={styles.bloquesError}>
                          <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
                          <Text style={styles.bloquesErrorText}>
                            No se pudieron obtener los turnos para esta fecha.
                          </Text>
                          <TouchableOpacity
                            style={styles.retrySmallBtn}
                            onPress={() => refetchBloques()}
                          >
                            <Text style={styles.retrySmallBtnText}>Reintentar</Text>
                          </TouchableOpacity>
                        </View>
                      ) : !bloques || bloques.length === 0 ? (
                        <View style={styles.bloquesEmpty}>
                          <Ionicons
                            name="calendar-clear-outline"
                            size={32}
                            color={Colors.textDisabled}
                          />
                          <Text style={styles.bloquesEmptyTitle}>
                            Sin turnos para este día
                          </Text>
                          <Text style={styles.bloquesEmptySubtitle}>
                            La instalación no cuenta con horarios de apertura asignados para este día de la semana o se encuentra sin cupos.
                          </Text>
                        </View>
                      ) : (
                        /* Grilla de Bloques */
                        <View style={styles.bloquesGrid}>
                          {bloques.map((bloque, index) => {
                            const isWithin48 = isBloqueWithin48h(
                              selectedDate,
                              bloque.horaInicio,
                              min48h
                            );
                            const isBeyond2M = isBloqueBeyond2Months(
                              selectedDate,
                              bloque.horaInicio,
                              max2m
                            );
                            const isSelectable =
                              bloque.disponible && !isWithin48 && !isBeyond2M;
                            const isSelected =
                              selectedBloque !== null &&
                              selectedBloque.horaInicio === bloque.horaInicio &&
                              selectedBloque.horaFin === bloque.horaFin;

                            const timeLabel = `${formatHora(bloque.horaInicio)} - ${formatHora(
                              bloque.horaFin
                            )}`;

                            return (
                              <TouchableOpacity
                                key={`${bloque.horaInicio}-${index}`}
                                onPress={() => handleSelectBloque(bloque, isSelectable)}
                                disabled={!isSelectable}
                                activeOpacity={0.8}
                                style={[
                                  styles.bloqueBtn,
                                  isSelectable && styles.bloqueBtnAvailable,
                                  isSelected && styles.bloqueBtnSelected,
                                  !isSelectable && styles.bloqueBtnDisabled,
                                ]}
                              >
                                <Ionicons
                                  name={
                                    isSelected
                                      ? "checkmark-circle"
                                      : isSelectable
                                      ? "time-outline"
                                      : isWithin48
                                      ? "alert-circle-outline"
                                      : "close-circle-outline"
                                  }
                                  size={15}
                                  color={
                                    isSelected
                                      ? Colors.textOnPrimary
                                      : isSelectable
                                      ? Colors.primary
                                      : Colors.slotDisabledText
                                  }
                                />
                                <Text
                                  style={[
                                    styles.bloqueTimeText,
                                    isSelectable && styles.bloqueTimeTextAvailable,
                                    isSelected && styles.bloqueTimeTextSelected,
                                    !isSelectable && styles.bloqueTimeTextDisabled,
                                  ]}
                                >
                                  {timeLabel}
                                </Text>

                                <Text
                                  style={[
                                    styles.bloqueStatusBadge,
                                    isSelectable && styles.bloqueStatusBadgeAvailable,
                                    isSelected && styles.bloqueStatusBadgeSelected,
                                    !isSelectable && styles.bloqueStatusBadgeDisabled,
                                  ]}
                                >
                                  {isSelected
                                    ? "Seleccionado"
                                    : isWithin48
                                    ? "< 48 hs"
                                    : isBeyond2M
                                    ? "> 2 meses"
                                    : bloque.disponible
                                    ? "Disponible"
                                    : "Ocupado"}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      )}

                      {/* Botón de Confirmación y Continuación */}
                      {selectedBloque && (
                        <View style={styles.confirmSection}>
                          <View style={styles.confirmSummaryBox}>
                            <View style={styles.confirmSummaryRow}>
                              <Ionicons name="calendar" size={16} color={Colors.primary} />
                              <Text style={styles.confirmSummaryDate}>
                                {formattedSelectedDate}
                              </Text>
                            </View>
                            <View style={styles.confirmSummaryRow}>
                              <Ionicons name="time" size={16} color={Colors.primary} />
                              <Text style={styles.confirmSummaryTime}>
                                {formatHora(selectedBloque.horaInicio)} a{" "}
                                {formatHora(selectedBloque.horaFin)} hs
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={handleProceedToBooking}
                            activeOpacity={0.85}
                          >
                            <Ionicons
                              name="arrow-forward-circle"
                              size={20}
                              color={Colors.textOnPrimary}
                            />
                            <Text style={styles.confirmBtnText}>
                              Continuar reserva · ${service.price.toLocaleString("es-AR")}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingBottom: Spacing["3xl"],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  myReservationsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  myReservationsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },

  ruleNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  ruleNoticeText: {
    fontSize: 12,
    color: "#1E40AF",
    flex: 1,
    lineHeight: 16,
  },
  ruleNoticeBold: {
    fontWeight: Typography.fontWeight.bold,
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },

  errorContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  errorSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  retryBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
  },

  serviceList: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  serviceCardActive: {
    borderColor: Colors.primary,
    ...Shadow.md,
  },
  serviceCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.base,
  },
  serviceIconWrap: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceIconWrapActive: {
    backgroundColor: Colors.primary,
  },
  serviceInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  serviceName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  serviceMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaTextPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  metaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  arrowWrap: {
    padding: Spacing.xs,
  },

  // Panel expandible
  expandedPanel: {
    backgroundColor: "#FAFAFA",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
  },
  panelDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  selectedDateSub: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textTransform: "capitalize",
    marginBottom: Spacing.sm,
  },

  // Tira horizontal de días
  daysStrip: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  dayItem: {
    width: 54,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  dayItemDisabled: {
    backgroundColor: Colors.slotDisabled,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  dayName: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
  },
  dayNameActive: {
    color: Colors.textOnPrimary,
  },
  dayNameDisabled: {
    color: Colors.slotDisabledText,
  },
  dayNum: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginVertical: 1,
  },
  dayNumActive: {
    color: Colors.textOnPrimary,
  },
  dayNumDisabled: {
    color: Colors.slotDisabledText,
  },
  dayMonth: {
    fontSize: 9,
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  dayMonthActive: {
    color: Colors.textOnPrimary,
  },
  dayMonthDisabled: {
    color: Colors.slotDisabledText,
  },
  dayUnder48Tag: {
    fontSize: 8,
    color: Colors.error,
    fontWeight: Typography.fontWeight.bold,
    position: "absolute",
    bottom: 2,
  },

  // Estados de bloques
  bloquesLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  bloquesLoadingText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  bloquesError: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  bloquesErrorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    textAlign: "center",
  },
  retrySmallBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: Spacing.xs,
  },
  retrySmallBtnText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.error,
    fontWeight: Typography.fontWeight.semibold,
  },
  bloquesEmpty: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  bloquesEmptyTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  bloquesEmptySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  // Grilla de bloques
  bloquesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  bloqueBtn: {
    width: "48%",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  bloqueBtnAvailable: {
    backgroundColor: Colors.surface,
    borderColor: "#CBD5E1",
  },
  bloqueBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    ...Shadow.sm,
  },
  bloqueBtnDisabled: {
    backgroundColor: Colors.slotDisabled,
    borderColor: Colors.border,
    opacity: 0.7,
  },
  bloqueTimeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 3,
  },
  bloqueTimeTextAvailable: {
    color: Colors.textPrimary,
  },
  bloqueTimeTextSelected: {
    color: Colors.textOnPrimary,
  },
  bloqueTimeTextDisabled: {
    color: Colors.slotDisabledText,
  },
  bloqueStatusBadge: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  bloqueStatusBadgeAvailable: {
    color: Colors.success,
    backgroundColor: Colors.successLight,
  },
  bloqueStatusBadgeSelected: {
    color: Colors.textOnPrimary,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  bloqueStatusBadgeDisabled: {
    color: Colors.slotDisabledText,
    backgroundColor: "transparent",
  },

  // Sección de Confirmación
  confirmSection: {
    marginTop: Spacing.base,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmSummaryBox: {
    backgroundColor: "#F3F4F6",
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 4,
    marginBottom: Spacing.sm,
  },
  confirmSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  confirmSummaryDate: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textTransform: "capitalize",
  },
  confirmSummaryTime: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 4,
    ...Shadow.md,
  },
  confirmBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
