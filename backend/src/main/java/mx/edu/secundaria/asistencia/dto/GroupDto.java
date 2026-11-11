package mx.edu.secundaria.asistencia.dto;

public record GroupDto(
    String id,
    int grade,
    String letter,
    String name,
    int studentCount,
    String teacherId,
    String teacherName,
    String schoolYear
) {
}
