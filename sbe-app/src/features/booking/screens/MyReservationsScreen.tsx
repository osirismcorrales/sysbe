import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";

type Props = NativeStackScreenProps<BookingStackParamList, "MyReservations">;

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  reservado: { label: "Reservado", bg: Colors.errorLight, text: Colors.primary, icon: "calendar" },
  completado: { label: "Completado", bg: Colors.successLight, text: Colors.success, icon: "checkmark-circle" },
  cancelado: { label: "Cancelado", bg: Colors.surfaceElevated, text: Colors.textDisabled, icon: "close-circle" },
  pendiente: { label: "Pendiente", bg: Colors.warningLight, text: Colors.warning, icon: "alert-circle" },
};

type Filter = "activas" | "pasadas";

export default function MyReservationsScreen({ navigation }: Props) {
  const { reservations, cancelReservation } = useApp();
  const [filter, setFilter] = useState<Filter>("activas");

  const activeStatuses = ["reservado", "pendiente"];
  const pastStatuses = ["completado", "cancelado"];

  const filtered = reservations.filter((r) =>
    filter === "activas"
      ? activeStatuses.includes(r.status)
      : pastStatuses.includes(r.status)
  );

  const canCancel = (dateStr: string): boolean => {
    const reservationDate = new Date(dateStr + "T00:00:00");
    const now = new Date();
    const diff = reservationDate.getTime() - now.getTime();
    return diff > 48 * 60 * 60 * 1000;
  };

  const handleCancel = (id: string, serviceName: string) => {
    Alert.alert(
      "Cancelar reserva",
      `¿Estás seguro que querés cancelar "${serviceName}"?\n\nSe devolverán los puntos utilizados.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: () => {
            cancelReservation(id);
            Alert.alert("Reserva cancelada", "Los puntos fueron devueltos a tu cuenta.");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Reservas</Text>
        <View style={{ width: 36 }} />
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
            <Ionicons name="calendar-outline" size={48} color={Colors.textDisabled} />
            <Text style={styles.emptyText}>
              No hay reservas {filter === "activas" ? "activas" : "pasadas"}
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
            const cancelable = r.status === "reservado" && canCancel(r.date);

            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIconWrap}>
                    <Ionicons name={config.icon} size={24} color={config.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardService}>{r.serviceName}</Text>
                    <Text style={styles.cardDate}>{dateStr} · {r.time} hs</Text>
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
                    <Text style={styles.priceLabel}>Total pagado</Text>
                    <Text style={styles.priceValue}>
                      ${(r.price - r.discount).toLocaleString("es-AR")}
                    </Text>
                  </View>
                  {r.pointsEarned > 0 && (
                    <View style={styles.pointsRow}>
                      <Ionicons name="star" size={12} color={Colors.accent} />
                      <Text style={styles.pointsText}>
                        {r.status === "cancelado" ? "Puntos devueltos" : `+${r.pointsEarned} pts`}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {filter === "activas" && (
                  <View style={styles.actions}>
                    {cancelable && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => handleCancel(r.id, r.serviceName)}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close-circle-outline" size={16} color={Colors.error} />
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    )}
                    {!cancelable && r.status === "reservado" && (
                      <Text style={styles.noCancelHint}>
                        No se puede cancelar (menos de 48hs)
                      </Text>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
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
  filterTextActive: { color: Colors.textOnPrimary },

  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textDisabled,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  cardService: {
    fontSize: Typography.fontSize.md,
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
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },

  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  cardBottom: {},
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pointsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accent,
    fontWeight: Typography.fontWeight.semibold,
  },

  actions: {
    marginTop: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  noCancelHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDisabled,
    fontStyle: "italic",
  },
});
