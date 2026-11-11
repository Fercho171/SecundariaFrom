package mx.edu.secundaria.asistencia.model;

import java.time.DayOfWeek;

public enum Weekday {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY;

    public static Weekday fromDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> MONDAY;
            case TUESDAY -> TUESDAY;
            case WEDNESDAY -> WEDNESDAY;
            case THURSDAY -> THURSDAY;
            case FRIDAY -> FRIDAY;
            default -> throw new IllegalArgumentException("No hay clases en fin de semana: " + dayOfWeek);
        };
    }
}
