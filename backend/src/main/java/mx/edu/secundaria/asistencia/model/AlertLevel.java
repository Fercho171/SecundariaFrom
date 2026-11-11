package mx.edu.secundaria.asistencia.model;

public enum AlertLevel {
    ATTENTION,
    ALERT,
    RISK;

    /** Replica alertLevelFromAbsences() del frontend (mock-store.ts). */
    public static AlertLevel fromAbsences(int absences) {
        if (absences >= 8) return RISK;
        if (absences >= 5) return ALERT;
        if (absences >= 3) return ATTENTION;
        return null;
    }
}
