package mx.edu.secundaria.asistencia.model;

public enum CoverFileType {
    PDF,
    IMAGE,
    WORD,
    EXCEL;

    /** Replica coverFileTypeFromName() del frontend. Devuelve null si la extensión no está permitida. */
    public static CoverFileType fromFileName(String fileName) {
        if (fileName == null) {
            return null;
        }
        String name = fileName.toLowerCase();
        if (name.endsWith(".pdf")) return PDF;
        if (name.matches(".*\\.(png|jpe?g|gif|webp|heic)$")) return IMAGE;
        if (name.matches(".*\\.(doc|docx)$")) return WORD;
        if (name.matches(".*\\.(xls|xlsx)$")) return EXCEL;
        return null;
    }
}
