package mx.edu.secundaria.asistencia.util;

import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;

import java.util.List;

/** Cálculos de asistencia compartidos por varios servicios (equivalentes a mock-store.ts). */
public final class StatsUtil {

    private StatsUtil() {
    }

    public static double round1(double value) {
        return Math.round(value * 10) / 10.0;
    }

    public static long count(List<Attendance> records, AttendanceStatus status) {
        return records.stream().filter(r -> r.getStatus() == status).count();
    }

    /** Porcentaje = (presentes + retardos + justificados) / total, igual que el frontend. */
    public static double percentage(List<Attendance> records) {
        int total = records.isEmpty() ? 1 : records.size();
        long favorable = count(records, AttendanceStatus.PRESENT)
            + count(records, AttendanceStatus.LATE)
            + count(records, AttendanceStatus.JUSTIFIED);
        return round1((favorable * 100.0) / total);
    }

    public record StudentStats(int presents, int absences, int justified, int lates, double percentage) {
    }

    public static StudentStats studentStats(List<Attendance> records) {
        int presents = (int) count(records, AttendanceStatus.PRESENT);
        int absences = (int) count(records, AttendanceStatus.ABSENT);
        int justified = (int) count(records, AttendanceStatus.JUSTIFIED);
        int lates = (int) count(records, AttendanceStatus.LATE);
        return new StudentStats(presents, absences, justified, lates, percentage(records));
    }
}
