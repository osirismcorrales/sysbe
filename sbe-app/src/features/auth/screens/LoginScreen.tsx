import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useApp();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ dni?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { dni?: string; password?: string } = {};
    if (!dni.trim()) {
      newErrors.dni = "El DNI es obligatorio";
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      newErrors.dni = "Ingresá un DNI válido (7-8 dígitos)";
    }
    if (!password.trim()) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 4) {
      newErrors.password = "Mínimo 4 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    login();
    navigation.replace("App");
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.keyboardAvoiding}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.innerLayout}>
              {/* ── Header con fondo rojo institucional ── */}
              <View style={styles.header}>
                {/* Logo mejorado SBE UNSE — doble anillo */}
                <View style={styles.logoOuterRing}>
                  <View style={styles.logoInnerRing}>
                    <Text style={styles.logoTextSBE}>SBE</Text>
                  </View>
                </View>
                <Text style={styles.logoUnseLabel}>UNSE</Text>
                <Text style={styles.headerTitle}>Bienestar Estudiantil</Text>
                <Text style={styles.headerSubtitle}>
                  Sistema de Gestión · Polideportivo
                </Text>
              </View>

              {/* ── Tarjeta de Login ── */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Iniciar Sesión</Text>

                {/* Input DNI */}
                <View
                  style={[
                    styles.inputWrapper,
                    errors.dni ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="id-card-outline"
                    size={18}
                    color={errors.dni ? Colors.error : Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresá tu DNI"
                    placeholderTextColor={Colors.textDisabled}
                    value={dni}
                    onChangeText={(t) => {
                      setDni(t);
                      if (errors.dni) setErrors((e) => ({ ...e, dni: undefined }));
                    }}
                    keyboardType="numeric"
                    autoComplete="username"
                    maxLength={8}
                  />
                </View>
                {errors.dni && (
                  <Text style={styles.errorText}>{errors.dni}</Text>
                )}

                {/* Input Contraseña */}
                <View
                  style={[
                    styles.inputWrapper,
                    errors.password ? styles.inputError : null,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={errors.password ? Colors.error : Colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    placeholderTextColor={Colors.textDisabled}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errors.password)
                        setErrors((e) => ({ ...e, password: undefined }));
                    }}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}

                {/* Botón Ingresar */}
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handleLogin}
                  activeOpacity={0.85}
                >
                  <Text style={styles.btnPrimaryText}>Ingresar</Text>
                </TouchableOpacity>

                {/* Divisor */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>o</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Botón SIU Guaraní */}
                <TouchableOpacity
                  style={styles.btnGuarani}
                  onPress={() => {
                    login();
                    navigation.replace("App");
                  }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="school-outline"
                    size={18}
                    color={Colors.textOnAccent}
                    style={{ marginRight: Spacing.sm }}
                  />
                  <Text style={styles.btnGuaraniText}>
                    Ingresar con SIU Guaraní
                  </Text>
                </TouchableOpacity>

                {/* Olvidaste tu contraseña */}
                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.primary },
  keyboardAvoiding: { flex: 1 },
  innerLayout: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Empuja el formulario hacia arriba para que el teclado no lo tape
  },

  // ── Header ──
  header: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  logoOuterRing: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  logoInnerRing: {
    width: 82,
    height: 82,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.accentLight,
    ...Shadow.lg,
  },
  logoTextSBE: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary,
    letterSpacing: 3,
  },
  logoUnseLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 6,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.fontSize["2xl"],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textOnPrimary,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xs,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // ── Card ──
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing["2xl"],
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    ...Shadow.lg,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: "center",
  },

  // ── Inputs ──
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    height: "100%",
  },
  eyeButton: { padding: Spacing.xs },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },

  // ── Botones ──
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
    ...Shadow.sm,
  },
  btnPrimaryText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
    marginHorizontal: Spacing.md,
  },
  btnGuarani: {
    flexDirection: "row",
    backgroundColor: Colors.accentLight,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  btnGuaraniText: {
    color: Colors.textOnAccent,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  forgotBtn: { alignItems: "center", marginTop: Spacing.lg },
  forgotText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
