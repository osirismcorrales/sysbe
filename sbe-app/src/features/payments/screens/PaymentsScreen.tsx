import React from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";

const CONCEPT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  reserva: "calendar-outline",
  cuota: "card-outline",
  otro: "receipt-outline",
};

const STATUS_COLOR: Record<string, string> = {
  aprobado: Colors.success,
  pendiente: Colors.warning,
  rechazado: Colors.error,
};

export default function PaymentsScreen() {
  const { membership, payments, payMembership, refreshAll } = useApp();

  useFocusEffect(
    React.useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const handlePayMembership = () => {
    Alert.alert(
      "Pagar cuota",
      `Monto: $${membership.monthlyFee.toLocaleString("es-AR")}\n\nRedirigiendo a Mercado Pago...`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Simular pago exitoso",
          onPress: () => {
            payMembership();
            Alert.alert(
              "¡Cuota pagada!",
              "Tu cuota mensual fue registrada y acreditada correctamente."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing["3xl"] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Pagos</Text>
        </View>

        {/* Cuota mensual */}
        <View style={styles.feeCard}>
          <View style={styles.feeHeader}>
            <View style={styles.feeIconWrap}>
              <Ionicons name="card" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.feeTitle}>Cuota mensual</Text>
              <Text style={styles.feeDate}>
                Vence: {new Date(membership.dueDate + "T12:00:00").toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View
              style={[
                styles.feeStatusBadge,
                {
                  backgroundColor: membership.isPaid
                    ? Colors.successLight
                    : Colors.warningLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.feeStatusText,
                  { color: membership.isPaid ? Colors.success : Colors.warning },
                ]}
              >
                {membership.isPaid ? "Pagada" : "Pendiente"}
              </Text>
            </View>
          </View>

          <View style={styles.feeDivider} />

          <View style={styles.feeAmountRow}>
            <Text style={styles.feeAmountLabel}>Monto</Text>
            <Text style={styles.feeAmount}>
              ${membership.monthlyFee.toLocaleString("es-AR")}
            </Text>
          </View>

          {!membership.isPaid && membership.monthlyFee > 0 && (
            <TouchableOpacity
              style={styles.payBtn}
              onPress={handlePayMembership}
              activeOpacity={0.85}
            >
              <Ionicons
                name="card-outline"
                size={18}
                color={Colors.textOnPrimary}
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={styles.payBtnText}>Pagar con Mercado Pago</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Historial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de pagos</Text>
          {payments.length === 0 ? (
            <View>
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={36} color={Colors.textDisabled} />
                <Text style={styles.emptyTitle}>Sin pagos registrados en esta cuenta</Text>
                <Text style={styles.emptySubtitle}>
                  Los pagos de tus reservas y cuotas aparecerán reflejados aquí una vez procesados.
                </Text>
              </View>

              {/* Ejemplo ilustrativo de cómo se visualizan los pagos */}
              <View style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                  <Text style={styles.exampleTitle}>Ejemplo de cómo se reflejan los pagos:</Text>
                </View>

                <View style={[styles.paymentCard, styles.exampleCard]}>
                  <View style={styles.paymentIconWrap}>
                    <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentDesc}>Reserva Cancha de Pádel (Ejemplo)</Text>
                    <Text style={styles.paymentDate}>10 de Octubre · Mercado Pago</Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>$4.500</Text>
                    <Text style={[styles.paymentStatus, { color: Colors.success }]}>Aprobado</Text>
                  </View>
                </View>

                <View style={[styles.paymentCard, styles.exampleCard]}>
                  <View style={styles.paymentIconWrap}>
                    <Ionicons name="card-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentDesc}>Cuota mensual de membresía (Ejemplo)</Text>
                    <Text style={styles.paymentDate}>05 de Octubre · Transferencia</Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>$12.000</Text>
                    <Text style={[styles.paymentStatus, { color: Colors.warning }]}>Pendiente</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            payments.map((p) => (
              <View key={p.id} style={styles.paymentCard}>
                <View style={styles.paymentIconWrap}>
                  <Ionicons
                    name={CONCEPT_ICON[p.concept] ?? "receipt-outline"}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.paymentDesc}>{p.description}</Text>
                  <Text style={styles.paymentDate}>{p.date}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>
                    ${p.amount.toLocaleString("es-AR")}
                  </Text>
                  <Text style={[styles.paymentStatus, { color: STATUS_COLOR[p.status] ?? Colors.textSecondary }]}>
                    {p.status === "aprobado" ? "Aprobado" : p.status === "pendiente" ? "Pendiente" : "Rechazado"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },

  // Fee card
  feeCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.xl,
    ...Shadow.sm,
  },
  feeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  feeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
  },
  feeTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  feeDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  feeStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  feeStatusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  feeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  feeAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  feeAmountLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  feeAmount: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  payBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  payBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },

  // History
  section: {
    paddingHorizontal: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  paymentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  paymentDesc: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentRight: { alignItems: "flex-end", marginLeft: Spacing.sm },
  paymentAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  paymentStatus: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  exampleContainer: {
    marginTop: Spacing.xl,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  exampleTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    opacity: 0.9,
  },
});
