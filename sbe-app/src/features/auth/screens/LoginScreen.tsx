import React, { useState, useEffect } from "react";
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
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/AppNavigator";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import { getServerUrl, updateApiBaseUrl } from "../../../api";
import ServerConfigModal from "../components/ServerConfigModal";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export default function LoginScreen({ navigation }: Props) {
  const { login } = useApp();
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ dni?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);

  // Restaurar la URL del servidor guardada al montar la pantalla
  useEffect(() => {
    getServerUrl().then((url) => {
      updateApiBaseUrl(url);
    });
  }, []);

  const validate = (): boolean => {
    const newErrors: { dni?: string; password?: string } = {};
    if (!dni.trim()) {
      newErrors.dni = "El DNI no puede estar vacío";
    } else if (!/^\d{7,8}$/.test(dni.trim())) {
      newErrors.dni = "El DNI debe tener entre 7 y 8 números";
    }
    if (!password.trim()) {
      newErrors.password = "La contraseña no puede estar vacía";
    } else if (password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setLoginError(null);
    try {
      // POST http://localhost:8080/api/auth/login con LoginRequestDto
      await login({
        dni: dni.trim(),
        password: password.trim(),
      });
      navigation.replace("App");
    } catch (err: any) {
      const errorMsg =
        err?.message ||
        "No se pudo iniciar sesión. Verificá que tu DNI y contraseña sean correctos.";
      setLoginError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Modal de configuración de servidor */}
      <ServerConfigModal
        visible={showServerConfig}
        onClose={() => setShowServerConfig(false)}
      />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.keyboardAvoiding}>
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <View style={styles.innerLayout}>
              {/* ── Header con fondo rojo institucional ── */}
              <View style={styles.header}>
                {/* Botón configurar servidor */}
                <Pressable
                  style={styles.serverConfigBtn}
                  onPress={() => setShowServerConfig(true)}
                  hitSlop={12}
                >
                  <Ionicons
                    name="settings-outline"
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </Pressable>

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
                      if (loginError) setLoginError(null);
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
                      if (loginError) setLoginError(null);
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

                {/* Mensaje de error del backend */}
                {loginError && (
                  <View style={styles.loginErrorContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={Colors.error}
                      style={{ marginRight: Spacing.xs }}
                    />
                    <Text style={styles.loginErrorText}>{loginError}</Text>
                  </View>
                )}

                {/* Botón Ingresar */}
                <TouchableOpacity
                  style={[styles.btnPrimary, isLoading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.surface} />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Ingresar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
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
  serverConfigBtn: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.base,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
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
  loginErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 38, 38, 0.08)",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.25)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  loginErrorText: {
    flex: 1,
    color: Colors.error,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
});
