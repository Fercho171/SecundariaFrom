package mx.edu.secundaria.asistencia.model;

public enum JustificationReason {
    ILLNESS("Enfermedad"),
    MEDICAL_APPOINTMENT("Cita médica"),
    FAMILY("Problema familiar"),
    SCHOOL_ACTIVITY("Actividad escolar"),
    OTHER("Otro");

    private final String label;

    JustificationReason(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
