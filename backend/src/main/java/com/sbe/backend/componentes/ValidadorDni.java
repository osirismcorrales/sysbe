package com.sbe.backend.componentes;

import java.util.regex.Pattern;

/**
 * Componente reutilizable para validar el formato de un DNI argentino.
 *
 * <p>Un DNI válido consiste en 7 u 8 dígitos numéricos, sin puntos,
 * espacios ni guiones. Esta clase acepta el valor con esos separadores
 * y los quita antes de validar, para tolerar entradas como
 * {@code "30.123.456"} o {@code "30 123 456"}.</p>
 *
 * <p>No depende de ningún framework (Spring, JPA, Bean Validation),
 * por lo que puede reutilizarse en cualquier proyecto Java, sea o no
 * una aplicación web.</p>
 *
 * <p>Ejemplo de uso:</p>
 * <pre>{@code
 * if (!ValidadorDni.esValido(dto.dni())) {
 *     throw new IllegalArgumentException("El DNI ingresado no es válido");
 * }
 *
 * String limpio = ValidadorDni.normalizar(dto.dni()); // "30123456"
 * }</pre>
 *
 * @author Grupo ChangoSistematicos
 * @version 1.0
 */
public final class ValidadorDni {

    /** DNI argentino: 7 u 8 dígitos */
    private static final Pattern PATRON_DNI = Pattern.compile("^\\d{7,8}$");

    private ValidadorDni() {
    }

    /**
     * Valida que la cadena recibida tenga el formato de un DNI argentino
     * válido, tolerando puntos, espacios o guiones como separadores de miles.
     *
     * <p>Se consideran inválidos: valores nulos, cadenas vacías, con letras,
     * con menos de 7 o más de 8 dígitos, o que comiencen con cero (un DNI
     * real nunca empieza con 0).</p>
     *
     * @param dni el valor a validar, con o sin separadores
     * @return {@code true} si el valor, una vez normalizado, es un DNI
     *         con formato válido; {@code false} en caso contrario
     */
    public static boolean esValido(String dni) {
        if (dni == null) {
            return false;
        }
        String normalizado = normalizar(dni);
        return PATRON_DNI.matcher(normalizado).matches()
                && !normalizado.startsWith("0");
    }

    /**
     * Quita puntos, espacios y guiones de un DNI, dejando solo los dígitos.
     *
     * <p>No valida el resultado; se recomienda usar {@link #esValido}
     * antes o después de normalizar, según el caso de uso.</p>
     *
     * @param dni el valor a normalizar, puede contener separadores
     * @return el DNI sin separadores, o cadena vacía si {@code dni} es nulo
     */
    public static String normalizar(String dni) {
        if (dni == null) {
            return "";
        }
        return dni.replaceAll("[.\\-\\s]", "");
    }
}