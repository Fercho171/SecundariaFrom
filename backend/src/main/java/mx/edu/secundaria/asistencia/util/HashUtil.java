package mx.edu.secundaria.asistencia.util;

/** Hash determinístico usado para generar datos semilla reproducibles (equivalente al hash() de mock-store.ts). */
public final class HashUtil {

    private HashUtil() {
    }

    public static long hash(String value) {
        long total = 0;
        for (int i = 0; i < value.length(); i++) {
            total = (total * 31 + value.charAt(i)) & 0xFFFFFFFFL;
        }
        return total;
    }
}
