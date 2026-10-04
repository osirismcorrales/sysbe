import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import { useApp } from "../../../data/AppContext";
import { useUpdateMeMutation } from "../../../api/hooks/useUserQuery";
import { mapUsuarioDtoToUser } from "../../../data/types";
import type { UsuarioUpdateMeDto } from "../../../data/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "../../../navigation/ProfileStack";

type Props = NativeStackScreenProps<ProfileStackParamList, "EditProfile">;

type FormErrors = {
  nombreCompleto?: string;
  email?: string;
  fechaNacimiento?: string;
  domicilio?: string;
  password?: string;
};

/**
 * Formatea una Date a "DD/MM/AAAA" para mostrar al usuario.
 */
function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Parsea un string ISO o fecha del backend a un objeto Date.
 */
function parseISOtoDate(isoDate: string): Date | null {
  if (!isoDate) return null;
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export default function EditProfileScreen({ navigation }: Props) {
  const { user, updateUser } = useApp();
  const [nombreCompleto, setNombreCompleto] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [fechaNacimiento, setFechaNacimiento] = useState<Date | null>(
    parseISOtoDate(user.fechaNacimiento)
  );
  const [domicilio, setDomicilio] = useState(user.domicilio);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { mutate: updateMe, isPending } = useUpdateMeMutation();

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (event.type === "set" && selectedDate) {
      setFechaNacimiento(selectedDate);
      clearError("fechaNacimiento");
    }
  };

  const handleDateConfirmIOS = () => {
    setShowDatePicker(false);
  };

  const handleDateCancelIOS = () => {
    setShowDatePicker(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // nombreCompleto: @NotBlank, @Size(max = 100)
    if (!nombreCompleto.trim()) {
      newErrors.nombreCompleto = "El nombre completo no puede estar vacío";
    } else if (nombreCompleto.trim().length > 100) {
      newErrors.nombreCompleto = "No puede superar los 100 caracteres";
    }

    // email: @NotBlank, @Email, @Size(max = 120)
    if (!email.trim()) {
      newErrors.email = "El email no puede estar vacío";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "El email no tiene un formato válido";
    } else if (email.trim().length > 120) {
      newErrors.email = "No puede superar los 120 caracteres";
    }

    // fechaNacimiento: @NotNull, @Past
    if (!fechaNacimiento) {
      newErrors.fechaNacimiento = "La fecha de nacimiento no puede ser vacía";
    } else if (fechaNacimiento >= new Date()) {
      newErrors.fechaNacimiento = "Debe ser una fecha pasada";
    }

    // domicilio: @NotBlank, @Size(max = 100)
    if (!domicilio.trim()) {
      newErrors.domicilio = "El domicilio no puede estar vacío";
    } else if (domicilio.trim().length > 100) {
      newErrors.domicilio = "No puede superar los 100 caracteres";
    }

    // password: @Size(min = 8) — solo si se completó
    if (password.length > 0 && password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const dto: UsuarioUpdateMeDto = {
      nombreCompleto: nombreCompleto.trim(),
      email: email.trim(),
      fechaNacimiento: fechaNacimiento!.toISOString(),
      domicilio: domicilio.trim(),
    };

    // Solo incluir password si el usuario escribió una nueva
    if (password.length > 0) {
      dto.password = password;
    }

    updateMe(dto, {
      onSuccess: (updatedDto) => {
        const mapped = mapUsuarioDtoToUser(updatedDto);
        updateUser(mapped);
        Alert.alert(
          "Datos actualizados",
          "Tus datos se guardaron correctamente.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      },
      onError: (err: any) => {
        const errorMsg = err?.message || "No se pudo conectar con el servidor.";
        Alert.alert("Error al actualizar", errorMsg);
      },
    });
  };

  // Fecha máxima: hoy (debe ser @Past)
  const today = new Date();
  // Fecha mínima razonable
  const minDate = new Date(1920, 0, 1);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar datos</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* DNI - read only */}
          <Text style={styles.label}>DNI</Text>
          <View style={[styles.inputWrapper, styles.inputDisabled]}>
            <TextInput
              style={[styles.input, { color: Colors.textDisabled }]}
              value={user.dni}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={16} color={Colors.textDisabled} />
          </View>

          {/* Nombre completo */}
          <Text style={styles.label}>Nombre completo</Text>
          <View style={[styles.inputWrapper, errors.nombreCompleto && styles.inputError]}>
            <TextInput
              style={styles.input}
              value={nombreCompleto}
              onChangeText={(t) => {
                setNombreCompleto(t);
                clearError("nombreCompleto");
              }}
              placeholder="Nombre y apellido"
              placeholderTextColor={Colors.textDisabled}
              maxLength={100}
            />
          </View>
          {errors.nombreCompleto && <Text style={styles.errorText}>{errors.nombreCompleto}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clearError("email");
              }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={120}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Fecha de nacimiento — Date Picker */}
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            style={[
              styles.inputWrapper,
              errors.fechaNacimiento && styles.inputError,
            ]}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={errors.fechaNacimiento ? Colors.error : Colors.primary}
              style={{ marginRight: Spacing.sm }}
            />
            <Text
              style={[
                styles.dateText,
                !fechaNacimiento && styles.dateTextPlaceholder,
              ]}
            >
              {fechaNacimiento ? formatDate(fechaNacimiento) : "Seleccionar fecha"}
            </Text>
            <Ionicons
              name="chevron-down-outline"
              size={16}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          {errors.fechaNacimiento && (
            <Text style={styles.errorText}>{errors.fechaNacimiento}</Text>
          )}

          {/* Android Date Picker — se muestra como diálogo nativo */}
          {showDatePicker && Platform.OS === "android" && (
            <DateTimePicker
              value={fechaNacimiento || new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={today}
              minimumDate={minDate}
              onChange={handleDateChange}
            />
          )}

          {/* iOS Date Picker — se muestra en un modal elegante */}
          {Platform.OS === "ios" && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={handleDateCancelIOS}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={handleDateCancelIOS}>
                      <Text style={styles.modalCancelText}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Fecha de nacimiento</Text>
                    <TouchableOpacity onPress={handleDateConfirmIOS}>
                      <Text style={styles.modalDoneText}>Listo</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={fechaNacimiento || new Date(2000, 0, 1)}
                    mode="date"
                    display="spinner"
                    maximumDate={today}
                    minimumDate={minDate}
                    onChange={handleDateChange}
                    style={{ height: 200 }}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* Domicilio */}
          <Text style={styles.label}>Domicilio</Text>
          <View style={[styles.inputWrapper, errors.domicilio && styles.inputError]}>
            <Ionicons
              name="location-outline"
              size={18}
              color={errors.domicilio ? Colors.error : Colors.textSecondary}
              style={{ marginRight: Spacing.sm }}
            />
            <TextInput
              style={styles.input}
              value={domicilio}
              onChangeText={(t) => {
                setDomicilio(t);
                clearError("domicilio");
              }}
              placeholder="Dirección completa"
              placeholderTextColor={Colors.textDisabled}
              maxLength={100}
            />
          </View>
          {errors.domicilio && <Text style={styles.errorText}>{errors.domicilio}</Text>}

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Cambiar contraseña (opcional)</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Nueva contraseña */}
          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={errors.password ? Colors.error : Colors.textSecondary}
              style={{ marginRight: Spacing.sm }}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clearError("password");
              }}
              placeholder="Dejá vacío para no cambiar"
              placeholderTextColor={Colors.textDisabled}
              secureTextEntry={!showPassword}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
              style={{ padding: Spacing.xs }}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={18}
                color={Colors.textSecondary}
              />
            </Pressable>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Botón Guardar */}
          <TouchableOpacity
            style={[styles.saveBtn, isPending && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: { padding: Spacing.base, paddingBottom: Spacing["2xl"] },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 52,
    ...Shadow.sm,
  },
  inputDisabled: { backgroundColor: Colors.surfaceElevated },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    height: "100%",
  },
  dateText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  dateTextPlaceholder: {
    color: Colors.textDisabled,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginHorizontal: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    ...Shadow.sm,
  },
  saveBtnText: {
    color: Colors.textOnPrimary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },

  // Modal iOS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing["2xl"],
    ...Shadow.lg,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  modalCancelText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  modalDoneText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
});
