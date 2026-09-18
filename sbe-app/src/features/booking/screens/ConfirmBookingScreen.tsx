import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BookingStackParamList } from "../../../navigation/BookingStack";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { Reservation, Payment } from "../../../data/types";

type Props = NativeStackScreenProps<BookingStackParamList, "ConfirmBooking">;

export default function ConfirmBookingScreen({ navigation, route }: Props) {
  const { serviceId, serviceName, date, time, price } = route.params;
  const { membership, totalPoints, addReservation, addPayment } = useApp();
  const [usePoints, setUsePoints] = useState(false);

  const discount = Math.round(price * (membership.discountPercent / 100));
  const afterDiscount = price - discount;
  const pointsDiscount = usePoints ? Math.min(totalPoints * 10, afterDiscount) : 0;
  const finalPrice = afterDiscount - pointsDiscount;
  const pointsToUse = usePoints ? Math.ceil(pointsDiscount / 10) : 0;
  const pointsEarned = Math.round(finalPrice / 50) * 10;

  const formattedDate = (() => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  })();

  const handlePay = () => {
    Alert.alert(
      "Mercado Pago",
      `Redirigiendo a Mercado Pago...\nMonto: $${finalPrice.toLocaleString("es-AR")}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Simular pago exitoso",
          onPress: () => {
            const reservationId = `res-${Date.now()}`;
            const reservation: Reservation = {
              id: reservationId,
              serviceId,
              serviceName,
              date,
              time,
              price,
              discount: discount + pointsDiscount,
              pointsUsed: pointsToUse,
              pointsEarned,
              status: "reservado",
              createdAt: new Date().toISOString().split("T")[0],
            };
            addReservation(reservation);

            const payment: Payment = {
              id: `pay-${Date.now()}`,
              concept: "reserva",
              description: `${serviceName} — ${formattedDate}`,
              amount: finalPrice,
              date: new Date().toISOString().split("T")[0],
              status: "aprobado",
              reservationId,
            };
            addPayment(payment);

            Alert.alert(
              "¡Reserva confirmada!",
              `${serviceName}\n${formattedDate} a las ${time} hs\n\nSumaste ${pointsEarned} puntos 🎉`,
              [
                {
                  text: "Ir al inicio",
                  onPress: () => navigation.popToTop(),
                },
              ]
            );
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
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
        {/* Tarjeta de resumen */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="calendar" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.summaryService}>{serviceName}</Text>
          <Text style={styles.summaryDate}>{formattedDate}</Text>
          <Text style={styles.summaryTime}>{time} hs</Text>
        </View>

        {/* Desglose de precio */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Detalle del pago</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio base</Text>
            <Text style={styles.priceValue}>
              ${price.toLocaleString("es-AR")}
            </Text>
          </View>

          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>
                Descuento socio {membership.type} (-{membership.discountPercent}%)
              </Text>
              <Text style={styles.discountValue}>
                -${discount.toLocaleString("es-AR")}
              </Text>
            </View>
          )}

          {/* Toggle puntos */}
          {totalPoints > 0 && (
            <TouchableOpacity
              style={styles.pointsToggle}
              onPress={() => setUsePoints(!usePoints)}
              activeOpacity={0.8}
            >
              <View style={styles.pointsToggleLeft}>
                <Ionicons
                  name={usePoints ? "checkbox" : "square-outline"}
                  size={22}
                  color={usePoints ? Colors.primary : Colors.textSecondary}
                />
                <Text style={styles.pointsToggleText}>
                  Usar mis puntos ({totalPoints} pts)
                </Text>
              </View>
              {usePoints && (
                <Text style={styles.discountValue}>
                  -${pointsDiscount.toLocaleString("es-AR")}
                </Text>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>
              ${finalPrice.toLocaleString("es-AR")}
            </Text>
          </View>

          <View style={styles.pointsEarnedRow}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.pointsEarnedText}>
              Ganarás {pointsEarned} puntos con esta reserva
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Botón pagar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
          activeOpacity={0.85}
        >
          <Ionicons
            name="card-outline"
            size={20}
            color={Colors.textOnPrimary}
            style={{ marginRight: Spacing.sm }}
          />
          <Text style={styles.payBtnText}>
            Pagar con Mercado Pago · ${finalPrice.toLocaleString("es-AR")}
          </Text>
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
  },
  summaryIconWrap: {
    width: 56,
    height: 56,
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
  },
  summaryDate: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  summaryTime: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
    marginTop: Spacing.xs,
  },

  // Prices
  priceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  priceTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  priceLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  discountLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.success,
  },
  discountValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success,
  },
  pointsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  pointsToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  pointsToggleText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: Typography.fontWeight.medium,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
  },
  pointsEarnedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: Colors.warningLight,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  pointsEarnedText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.warning,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    ...Shadow.md,
  },
  payBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.sm,
  },
  payBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
});
