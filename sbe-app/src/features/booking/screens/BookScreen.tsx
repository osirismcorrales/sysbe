import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import type { Service, ServiceCategory } from "../../../data/types";

type Props = NativeStackScreenProps<BookingStackParamList, "BookService">;

// ── Tipos internos ──
type Category = { id: ServiceCategory; label: string };
type DayItem = {
  id: string;
  dayLabel: string;
  num: number;
  dateISO: string;
  disabled: boolean;
};

const CATEGORIES: Category[] = [
  { id: "deportes", label: "Deportes" },
  { id: "pileta", label: "Pileta" },
  { id: "asadores", label: "Asadores" },
];

const DAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

function generateDays(): DayItem[] {
  const now = new Date();
  const minDate = new Date(now.getTime() + 48 * 60 * 60 * 1000); // +48hs
  const days: DayItem[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    days.push({
      id: String(i),
      dayLabel: DAY_NAMES[d.getDay()],
      num: d.getDate(),
      dateISO: iso,
      disabled: d < minDate,
    });
  }
  return days;
}

export default function BookScreen({ navigation }: Props) {
  const { services } = useApp();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("deportes");
  const days = useMemo(generateDays, []);
  const firstEnabled = days.find((d) => !d.disabled);
  const [activeDay, setActiveDay] = useState(firstEnabled?.id ?? "2");
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  const selectedDate = days.find((d) => d.id === activeDay)?.dateISO ?? "";

  const filteredServices = services.filter((s) => s.category === activeCategory);

  const toggleSlot = (serviceId: string, time: string, available: boolean) => {
    if (!available) return;
    setSelectedSlots((prev) => ({
      ...prev,
      [serviceId]: prev[serviceId] === time ? "" : time,
    }));
  };

  const handleConfirm = (service: Service) => {
    const slot = selectedSlots[service.id];
    if (!slot) return;
    navigation.navigate("ConfirmBooking", {
      serviceId: service.id,
      serviceName: service.name,
      date: selectedDate,
      time: slot,
      price: service.price,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reservar servicio</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("MyReservations")}
            style={styles.myReservationsBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="list-outline" size={16} color={Colors.primary} />
            <Text style={styles.myReservationsText}>Mis reservas</Text>
          </TouchableOpacity>
        </View>

        {/* Categorías */}
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                activeCategory === cat.id && styles.categoryTabActive,
              ]}
              onPress={() => {
                setActiveCategory(cat.id);
                setSelectedSlots({});
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.id && styles.categoryTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector de días — strip horizontal */}
        <View style={styles.daysStripContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysStrip}
          >
            {days.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dayItem,
                  activeDay === item.id && styles.dayItemActive,
                  item.disabled && styles.dayItemDisabled,
                ]}
                onPress={() => {
                  if (!item.disabled) {
                    setActiveDay(item.id);
                    setSelectedSlots({});
                  }
                }}
                activeOpacity={item.disabled ? 1 : 0.8}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    activeDay === item.id && styles.dayLabelActive,
                    item.disabled && styles.dayLabelDisabled,
                  ]}
                >
                  {item.dayLabel}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    activeDay === item.id && styles.dayNumActive,
                    item.disabled && styles.dayNumDisabled,
                  ]}
                >
                  {item.num}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Aviso 48hs */}
        <View style={styles.ruleNotice}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.info} />
          <Text style={styles.ruleNoticeText}>
            Las reservas deben realizarse con mínimo 48 hs de anticipación
          </Text>
        </View>

        {/* Lista de servicios */}
        <View style={styles.serviceList}>
          {filteredServices.map((service) => (
            <View key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceHeader}>
                <View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <View style={styles.serviceMetaRow}>
                    <Ionicons
                      name="people-outline"
                      size={13}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.serviceMeta}>
                      {" "}Máx. {service.maxPeople} personas
                    </Text>
                    <Text style={styles.servicePrice}>
                      {" "}· ${service.price.toLocaleString("es-AR")}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.availabilityBadge,
                    {
                      backgroundColor: service.available
                        ? Colors.successLight
                        : Colors.errorLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.availabilityText,
                      { color: service.available ? Colors.success : Colors.error },
                    ]}
                  >
                    {service.available ? "Disponible" : "Sin disponibilidad"}
                  </Text>
                </View>
              </View>

              {service.available && service.slots.length > 0 ? (
                <>
                  <Text style={styles.slotsLabel}>Horarios disponibles</Text>
                  <View style={styles.slotsGrid}>
                    {service.slots.map((slot) => {
                      const isSelected = selectedSlots[service.id] === slot.time;
                      const isDisabled = !slot.available;
                      return (
                        <TouchableOpacity
                          key={slot.time}
                          style={[
                            styles.slotBtn,
                            isDisabled
                              ? styles.slotDisabled
                              : isSelected
                              ? styles.slotSelected
                              : styles.slotAvailable,
                          ]}
                          onPress={() =>
                            toggleSlot(service.id, slot.time, slot.available)
                          }
                          activeOpacity={isDisabled ? 1 : 0.8}
                        >
                          <Text
                            style={
                              isDisabled
                                ? styles.slotTextDisabled
                                : isSelected
                                ? styles.slotTextSelected
                                : styles.slotTextAvailable
                            }
                          >
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {selectedSlots[service.id] && (
                    <TouchableOpacity
                      style={styles.confirmBtn}
                      activeOpacity={0.85}
                      onPress={() => handleConfirm(service)}
                    >
                      <Ionicons
                        name="card-outline"
                        size={16}
                        color={Colors.primary}
                        style={{ marginRight: Spacing.xs }}
                      />
                      <Text style={styles.confirmBtnText}>
                        Confirmar y pagar · ${service.price.toLocaleString("es-AR")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : !service.available ? (
                <View style={styles.noAvailability}>
                  <Ionicons
                    name="calendar-clear-outline"
                    size={24}
                    color={Colors.textDisabled}
                  />
                  <Text style={styles.noAvailabilityText}>
                    No hay turnos disponibles para este día
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
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
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  myReservationsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  myReservationsText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },

  categoryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryTabActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  categoryTextActive: { color: Colors.textOnPrimary },

  // Days strip
  daysStripContainer: {
    marginBottom: Spacing.xs,
  },
  daysStrip: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  dayItem: {
    width: 52,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayItemDisabled: {
    backgroundColor: Colors.slotDisabled,
    borderColor: Colors.slotDisabled,
    opacity: 0.5,
  },
  dayLabel: {
    fontSize: 9,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  dayLabelActive: { color: Colors.textOnPrimary },
  dayLabelDisabled: { color: Colors.slotDisabledText },
  dayNum: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dayNumActive: { color: Colors.textOnPrimary },
  dayNumDisabled: { color: Colors.slotDisabledText },

  // 48hr notice
  ruleNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  ruleNoticeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.info,
  },

  // Services
  serviceList: {
    paddingHorizontal: Spacing.base,
  },
  serviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  serviceName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  serviceMetaRow: { flexDirection: "row", alignItems: "center" },
  serviceMeta: { fontSize: Typography.fontSize.xs, color: Colors.textSecondary },
  servicePrice: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  availabilityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  availabilityText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Slots
  slotsLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  slotBtn: {
    width: "30%",
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: "center",
    borderWidth: 1,
  },
  slotAvailable: {
    backgroundColor: Colors.slotAvailable,
    borderColor: Colors.slotAvailableBorder,
  },
  slotSelected: {
    backgroundColor: Colors.slotSelected,
    borderColor: Colors.slotSelected,
  },
  slotDisabled: {
    backgroundColor: Colors.slotDisabled,
    borderColor: Colors.slotDisabled,
  },
  slotTextAvailable: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  slotTextSelected: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.slotSelectedText,
  },
  slotTextDisabled: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.slotDisabledText,
  },

  // Confirm
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm + 2,
  },
  confirmBtnText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },

  noAvailability: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  noAvailabilityText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDisabled,
    textAlign: "center",
  },
});
