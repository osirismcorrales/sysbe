import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useMyPagos } from "../../../api/hooks/usePaymentsQuery";
import type { Payment, PaymentStatus } from "../../../data/types";

// ── Mapas de presentación ────────────────────────────────────────────────────

const CONCEPT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  reserva: "calendar-outline",
  cuota: "card-outline",
  otro: "receipt-outline",
};

const STATUS_COLOR: Record<PaymentStatus, string> = {
  aprobado: Colors.success,
  pendiente: Colors.warning,
  rechazado: Colors.error,
  anulado: Colors.textDisabled,
};

const STATUS_LABEL: Record<PaymentStatus, string> = {
  aprobado: "Aprobado",
  pendiente: "Pendiente",
  rechazado: "Rechazado",
  anulado: "Anulado",
};

// ── Sub-componentes ──────────────────────────────────────────────────────────

function PaymentCard({ item }: { item: Payment }) {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentIconWrap}>
        <Ionicons
          name={CONCEPT_ICON[item.concept] ?? "receipt-outline"}
          size={20}
          color={Colors.primary}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.paymentDesc}>{item.description}</Text>
        <Text style={styles.paymentDate}>{item.date}</Text>
      </View>
      <View style={styles.paymentRight}>
        <Text style={styles.paymentAmount}>
          ${item.amount.toLocaleString("es-AR")}
        </Text>
        <Text
          style={[
            styles.paymentStatus,
            { color: STATUS_COLOR[item.status] ?? Colors.textSecondary },
          ]}
        >
          {STATUS_LABEL[item.status] ?? item.status}
        </Text>
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="receipt-outline" size={36} color={Colors.textDisabled} />
      <Text style={styles.emptyTitle}>Sin pagos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Los pagos de tus reservas y cuotas aparecerán aquí una vez procesados.
      </Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="cloud-offline-outline" size={36} color={Colors.error} />
      <Text style={[styles.emptyTitle, { color: Colors.error }]}>
        No se pudo cargar el historial
      </Text>
      <Text style={styles.emptySubtitle}>
        Verificá tu conexión e intentá de nuevo.
      </Text>
      <Text style={styles.retryText} onPress={onRetry}>
        Reintentar
      </Text>
    </View>
  );
}

// ── Pantalla principal ───────────────────────────────────────────────────────

export default function PaymentsScreen() {
  const { data: pagos, isFetching, isError, refetch } = useMyPagos();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderContent = () => {
    if (isFetching && !pagos) {
      return (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      );
    }

    if (isError) {
      return <ErrorState onRetry={() => { refetch(); }} />;
    }

    if (!pagos || pagos.length === 0) {
      return <EmptyState />;
    }

    return pagos.map((pago) => <PaymentCard key={pago.id} item={pago} />);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing["3xl"] }}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => { refetch(); }}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Pagos</Text>
          {pagos && pagos.length > 0 && (
            <Text style={styles.headerCount}>
              {pagos.length} registro{pagos.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Resumen rápido (si hay pagos) */}
        {pagos && pagos.length > 0 && (
          <View style={styles.summaryRow}>
            {(["aprobado", "pendiente", "rechazado"] as PaymentStatus[]).map((status) => {
              const count = pagos.filter((p) => p.status === status).length;
              if (count === 0) return null;
              return (
                <View key={status} style={styles.summaryChip}>
                  <View
                    style={[styles.summaryDot, { backgroundColor: STATUS_COLOR[status] }]}
                  />
                  <Text style={styles.summaryText}>
                    {count} {STATUS_LABEL[status].toLowerCase()}
                    {count !== 1 ? "s" : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Historial */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de pagos</Text>
          {renderContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  headerCount: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },

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

  loadingWrap: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
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
  retryText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
});
