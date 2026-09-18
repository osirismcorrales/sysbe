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
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/ProfileStack";
import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../../../navigation/AppTabs";

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, "ProfileMain">,
  BottomTabScreenProps<AppTabsParamList>
>;

export default function ProfileScreen({ navigation }: Props) {
  const { user, totalPoints, points, promotions, redeemPromotion, logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro que querés cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          logout();
          (navigation as any).getParent()?.getParent()?.replace("Login");
        },
      },
    ]);
  };

  const handleRedeem = (promoId: string, title: string, cost: number) => {
    if (totalPoints < cost) {
      Alert.alert("Puntos insuficientes", `Necesitás ${cost} puntos. Tenés ${totalPoints}.`);
      return;
    }
    Alert.alert("Canjear promoción", `¿Canjear "${title}" por ${cost} puntos?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Canjear",
        onPress: () => {
          redeemPromotion(promoId);
          Alert.alert("¡Canjeado!", `Usaste ${cost} puntos. Tu nuevo saldo: ${totalPoints - cost} pts`);
        },
      },
    ]);
  };

  const recentPoints = points.slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing["3xl"] }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        {/* Avatar + Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileDni}>DNI: {user.dni}</Text>
          <View style={styles.profileBadgesRow}>
            <View style={[styles.profileBadge, { backgroundColor: Colors.primaryLight }]}>
              <Text style={styles.profileBadgeText}>Socio {user.category}</Text>
            </View>
            <View style={[styles.profileBadge, { backgroundColor: user.status === "Activo" ? Colors.successLight : Colors.errorLight }]}>
              <Text style={[styles.profileBadgeTextDark, { color: user.status === "Activo" ? Colors.success : Colors.error }]}>
                {user.status}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.editBtnText}>Editar datos</Text>
          </TouchableOpacity>
        </View>

        {/* Puntos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Puntos</Text>
          <View style={styles.pointsCard}>
            <View style={styles.pointsHeader}>
              <View style={styles.pointsIconWrap}>
                <Ionicons name="star" size={24} color={Colors.accent} />
              </View>
              <View>
                <Text style={styles.pointsAmount}>{totalPoints}</Text>
                <Text style={styles.pointsLabel}>puntos disponibles</Text>
              </View>
            </View>
            <View style={styles.pointsDivider} />
            <Text style={styles.pointsHistoryTitle}>Últimos movimientos</Text>
            {recentPoints.map((p) => (
              <View key={p.id} style={styles.pointRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pointDesc}>{p.description}</Text>
                  <Text style={styles.pointDate}>{p.date}</Text>
                </View>
                <Text style={[styles.pointAmount, { color: p.amount > 0 ? Colors.success : Colors.error }]}>
                  {p.amount > 0 ? "+" : ""}{p.amount}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Promociones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canjear promociones</Text>
          {promotions.filter((p) => p.active).map((promo) => (
            <View key={promo.id} style={styles.promoCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoDesc}>{promo.description}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.promoBtn,
                  totalPoints < promo.pointsCost && styles.promoBtnDisabled,
                ]}
                onPress={() => handleRedeem(promo.id, promo.title, promo.pointsCost)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.promoBtnText,
                  totalPoints < promo.pointsCost && styles.promoBtnTextDisabled,
                ]}>
                  {promo.pointsCost} pts
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* QR y Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("CarnetQR")}
            activeOpacity={0.8}
          >
            <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
            <Text style={styles.menuItemText}>Mi Carnet QR</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
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

  profileCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.base,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  profileName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  profileDni: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  profileBadgesRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  profileBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  profileBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
  },
  profileBadgeTextDark: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
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

  pointsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  pointsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  pointsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.warningLight,
    alignItems: "center",
    justifyContent: "center",
  },
  pointsAmount: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.textPrimary,
  },
  pointsLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  pointsDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  pointsHistoryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  pointDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
  },
  pointDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textDisabled,
    marginTop: 2,
  },
  pointAmount: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.sm,
  },

  promoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  promoTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  promoDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  promoBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  promoBtnDisabled: {
    backgroundColor: Colors.surfaceElevated,
  },
  promoBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
  },
  promoBtnTextDisabled: {
    color: Colors.textDisabled,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  menuItemText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
  },
});
