import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../../../navigation/AppTabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";

type Props = {
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<AppTabsParamList, "Inicio">,
    NativeStackNavigationProp<RootStackParamList>
  >;
};

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  reservado: { label: "Reservado", bg: Colors.errorLight, text: Colors.primary },
  completado: { label: "Completado", bg: Colors.successLight, text: Colors.success },
  pendiente: { label: "Pendiente", bg: Colors.warningLight, text: Colors.warning },
  cancelado: { label: "Cancelado", bg: Colors.surfaceElevated, text: Colors.textDisabled },
};

export default function HomeScreen({ navigation }: Props) {
  const { user, totalPoints, reservations } = useApp();
  const insets = useSafeAreaInsets();

  const latestReservations = reservations
    .filter((r) => r.status !== "cancelado")
    .slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  })();

  const quickActions = [
    {
      id: "reserva",
      label: "Nueva reserva",
      icon: "calendar-outline" as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate("Reservas"),
    },
    {
      id: "carnet",
      label: "Mi carnet",
      icon: "id-card-outline" as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate("Perfil", { screen: "CarnetQR" } as any),
    },
    {
      id: "puntos",
      label: "Mis puntos",
      icon: "trophy-outline" as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate("Perfil"),
    },
    {
      id: "pagos",
      label: "Mis pagos",
      icon: "card-outline" as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate("Pagos"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} translucent />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header Unificado y Centrado */}
        <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.base }]}>
          <Text style={styles.headerGreeting}>{greeting},</Text>
          <Text style={styles.headerName}>{user.name}</Text>
          <Text style={styles.headerInfo}>
            DNI {user.dni} · {user.classification}
          </Text>

          {/* Badges Centrados */}
          <View style={styles.badgesRowCentered}>
            <View style={[styles.badge, { backgroundColor: Colors.primaryLight }]}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.textOnPrimary} />
              <Text style={styles.badgeTextWhite}> Socio {user.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: Colors.accent }]}>
              <Ionicons name="star" size={14} color={Colors.textOnAccent} />
              <Text style={styles.badgeTextDark}> {totalPoints} pts</Text>
            </View>
          </View>
        </View>

        {/* Accesos rápidos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
                activeOpacity={0.8}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name={action.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actividad reciente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <View style={styles.activityList}>
            {latestReservations.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={32} color={Colors.textDisabled} />
                <Text style={styles.emptyText}>No hay actividad reciente</Text>
              </View>
            ) : (
              latestReservations.map((item) => {
                const badge = STATUS_BADGE[item.status] ?? STATUS_BADGE.pendiente;
                const dateStr = new Date(item.date + "T12:00:00").toLocaleDateString(
                  "es-AR",
                  { weekday: "short", day: "numeric", month: "short" }
                );
                return (
                  <View key={item.id} style={styles.activityCard}>
                    <View style={styles.activityLeft}>
                      <View style={styles.activityIconWrap}>
                        <Ionicons
                          name={
                            item.status === "pendiente"
                              ? "alert-circle-outline"
                              : item.status === "completado"
                              ? "checkmark-circle-outline"
                              : "calendar-outline"
                          }
                          size={20}
                          color={
                            item.status === "completado"
                              ? Colors.success
                              : item.status === "pendiente"
                              ? Colors.warning
                              : Colors.primary
                          }
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityTitle}>{item.serviceName}</Text>
                        <Text style={styles.activitySubtitle}>
                          {dateStr} · {item.time} hs
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ── Header Unificado ──
  headerContainer: {
    backgroundColor: Colors.primary,
    alignItems: "flex-start",
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  headerGreeting: {
    fontSize: Typography.fontSize.sm,
    color: "rgba(255,255,255,0.75)",
  },
  headerName: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
    marginTop: Spacing.xs,
  },
  headerInfo: {
    fontSize: Typography.fontSize.xs,
    color: "rgba(255,255,255,0.6)",
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },
  badgesRowCentered: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-start",
    marginTop: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
  },
  badgeTextWhite: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  badgeTextDark: {
    color: Colors.textOnAccent,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },

  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionCard: {
    width: "47%",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    alignItems: "center",
    ...Shadow.sm,
  },
  actionIconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    textAlign: "center",
  },

  activityList: { gap: Spacing.sm },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...Shadow.sm,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  activityTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textDisabled,
  },
});
