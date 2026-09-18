import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/ProfileStack";

type Props = NativeStackScreenProps<ProfileStackParamList, "CarnetQR">;

export default function CarnetQRScreen({ navigation }: Props) {
  const { user } = useApp();

  // Simular un QR con un cuadrado de texto — en producción se usaría react-native-qrcode-svg
  const qrData = `SBE-UNSE|${user.dni}|${user.name}|${user.category}|${user.status}`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carnet</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Tarjeta de credencial */}
        <View style={styles.card}>
          {/* Encabezado de la credencial */}
          <View style={styles.cardHeader}>
            <View style={styles.cardLogo}>
              <Text style={styles.cardLogoText}>SBE</Text>
            </View>
            <View>
              <Text style={styles.cardInstitution}>UNSE</Text>
              <Text style={styles.cardSubtitle}>Bienestar Estudiantil</Text>
            </View>
          </View>

          {/* QR simulado */}
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code" size={140} color={Colors.textPrimary} />
            </View>
            <Text style={styles.qrHint}>Escaneá este código en el ingreso</Text>
          </View>

          {/* Datos del socio */}
          <View style={styles.dataSection}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Nombre</Text>
              <Text style={styles.dataValue}>{user.name}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>DNI</Text>
              <Text style={styles.dataValue}>{user.dni}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Categoría</Text>
              <Text style={styles.dataValue}>{user.category} · {user.classification}</Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Estado</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user.status === "Activo" ? Colors.successLight : Colors.errorLight },
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: user.status === "Activo" ? Colors.success : Colors.error },
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: user.status === "Activo" ? Colors.success : Colors.error },
                ]}>
                  {user.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
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
    color: Colors.textOnPrimary,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    justifyContent: "center",
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cardLogo: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLogoText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textOnPrimary,
    letterSpacing: 1,
  },
  cardInstitution: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  qrContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  qrBox: {
    width: 180,
    height: 180,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  qrHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },

  dataSection: { gap: Spacing.md },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dataLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  dataValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
