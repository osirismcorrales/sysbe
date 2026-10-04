/**
 * Modal para configurar la IP / URL del servidor backend.
 *
 * Pensado para prototipos y demos: permite al usuario introducir
 * la IP del servidor en la misma red WiFi sin recompilar la app.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Spacing, Radius, Typography, Shadow } from "../../../theme";
import {
  getServerUrl,
  saveServerUrl,
  buildApiUrl,
  getDefaultUrl,
  updateApiBaseUrl,
} from "../../../api";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ServerConfigModal({ visible, onClose }: Props) {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("8080");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null
  );
  const [currentUrl, setCurrentUrl] = useState("");

  // Cargar la URL guardada al abrir el modal
  useEffect(() => {
    if (visible) {
      loadCurrentConfig();
    }
  }, [visible]);

  const loadCurrentConfig = async () => {
    const url = await getServerUrl();
    setCurrentUrl(url);
    // Extraer IP y puerto de la URL guardada
    try {
      const match = url.match(
        /^https?:\/\/([^/:]+)(?::(\d+))?/
      );
      if (match) {
        setIp(match[1]);
        setPort(match[2] || "8080");
      }
    } catch {
      setIp("");
      setPort("8080");
    }
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!ip.trim()) return;
    Keyboard.dismiss();
    setIsTesting(true);
    setTestResult(null);

    const testUrl = buildApiUrl(ip.trim(), port);

    try {
      // Intentar conectar al endpoint de salud o login del backend
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(testUrl.replace(/\/api$/, ""), {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      // Cualquier respuesta del servidor (incluso 404) significa que está accesible
      setTestResult("success");
    } catch {
      setTestResult("error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!ip.trim()) return;
    const newUrl = buildApiUrl(ip.trim(), port);
    await saveServerUrl(newUrl);
    updateApiBaseUrl(newUrl);
    setCurrentUrl(newUrl);
    onClose();
  };

  const handleReset = async () => {
    const defaultUrl = getDefaultUrl();
    await saveServerUrl(defaultUrl);
    updateApiBaseUrl(defaultUrl);
    setCurrentUrl(defaultUrl);
    await loadCurrentConfig();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={() => {}}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="server-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Configurar Servidor</Text>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {/* URL actual */}
          <View style={styles.currentUrlBox}>
            <Text style={styles.currentUrlLabel}>URL actual</Text>
            <Text style={styles.currentUrlValue} numberOfLines={1}>
              {currentUrl}
            </Text>
          </View>

          {/* Input IP */}
          <Text style={styles.label}>Dirección IP del servidor</Text>
          <View style={styles.inputRow}>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Ionicons
                name="wifi-outline"
                size={16}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="192.168.1.10"
                placeholderTextColor={Colors.textDisabled}
                value={ip}
                onChangeText={(t) => {
                  setIp(t);
                  setTestResult(null);
                }}
                keyboardType="decimal-pad"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.colonSeparator}>:</Text>
            <View style={[styles.inputWrapper, { width: 80 }]}>
              <TextInput
                style={[styles.input, { textAlign: "center" }]}
                placeholder="8080"
                placeholderTextColor={Colors.textDisabled}
                value={port}
                onChangeText={(t) => {
                  setPort(t);
                  setTestResult(null);
                }}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
          </View>

          {/* Preview de la URL que se va a configurar */}
          {ip.trim() !== "" && (
            <Text style={styles.previewUrl}>
              → {buildApiUrl(ip.trim(), port)}
            </Text>
          )}

          {/* Resultado del test */}
          {testResult === "success" && (
            <View style={styles.resultBox}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={Colors.success}
              />
              <Text style={[styles.resultText, { color: Colors.success }]}>
                Servidor accesible
              </Text>
            </View>
          )}
          {testResult === "error" && (
            <View style={styles.resultBox}>
              <Ionicons
                name="alert-circle"
                size={16}
                color={Colors.error}
              />
              <Text style={[styles.resultText, { color: Colors.error }]}>
                No se pudo conectar. Verificá la IP y que el servidor esté
                corriendo.
              </Text>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.btnOutline}
              onPress={handleTest}
              disabled={isTesting || !ip.trim()}
              activeOpacity={0.7}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <>
                  <Ionicons
                    name="pulse-outline"
                    size={16}
                    color={Colors.primary}
                    style={{ marginRight: Spacing.xs }}
                  />
                  <Text style={styles.btnOutlineText}>Probar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btnPrimary,
                !ip.trim() && { opacity: 0.5 },
              ]}
              onPress={handleSave}
              disabled={!ip.trim()}
              activeOpacity={0.85}
            >
              <Ionicons
                name="save-outline"
                size={16}
                color={Colors.textOnPrimary}
                style={{ marginRight: Spacing.xs }}
              />
              <Text style={styles.btnPrimaryText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Botón restablecer */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={Colors.textSecondary}
              style={{ marginRight: Spacing.xs }}
            />
            <Text style={styles.resetText}>Restablecer a valor por defecto</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  modal: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing["2xl"],
    width: "100%",
    maxWidth: 400,
    ...Shadow.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryTransparent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  currentUrlBox: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  currentUrlLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  currentUrlValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    fontFamily: "monospace",
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceElevated,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    height: "100%",
    fontFamily: "monospace",
  },
  colonSeparator: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  previewUrl: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: "monospace",
    marginBottom: Spacing.md,
    marginLeft: Spacing.xs,
  },
  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  resultText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  btnOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: "transparent",
  },
  btnOutlineText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  btnPrimaryText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textOnPrimary,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  resetText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
});
