package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.JustificationDto;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.Attendance;
import mx.edu.secundaria.asistencia.model.AttendanceStatus;
import mx.edu.secundaria.asistencia.model.Justification;
import mx.edu.secundaria.asistencia.model.JustificationReason;
import mx.edu.secundaria.asistencia.model.Student;
import mx.edu.secundaria.asistencia.repository.AttendanceRepository;
import mx.edu.secundaria.asistencia.repository.JustificationRepository;
import mx.edu.secundaria.asistencia.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class JustificationService {

    private final JustificationRepository justificationRepository;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;

    public JustificationService(
        JustificationRepository justificationRepository,
        StudentRepository studentRepository,
        AttendanceRepository attendanceRepository
    ) {
        this.justificationRepository = justificationRepository;
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public List<JustificationDto> getJustifications() {
        return justificationRepository.findAllByOrderByDateDesc().stream().map(Mappers::justification).toList();
    }

    @Transactional
    public JustificationDto createJustification(
        String studentId, String dateStr, JustificationReason reason, String notes, MultipartFile file
    ) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> ApiException.notFound("No se encontró el alumno."));
        LocalDate date;
        try {
            date = LocalDate.parse(dateStr);
        } catch (Exception e) {
            throw ApiException.badRequest("La fecha no es válida.");
        }

        Justification justification = new Justification();
        justification.setId("jus-" + UUID.randomUUID());
        justification.setStudent(student);
        justification.setDate(date);
        justification.setReason(reason);
        justification.setNotes(notes == null ? "" : notes);
        justification.setCreatedAt(Instant.now());

        if (file != null && !file.isEmpty()) {
            try {
                justification.setFileName(file.getOriginalFilename());
                justification.setFileContentType(file.getContentType());
                justification.setFileData(file.getBytes());
            } catch (java.io.IOException e) {
                throw ApiException.badRequest("No se pudo leer el archivo adjunto.");
            }
        }

        justificationRepository.save(justification);

        Optional<Attendance> existing = attendanceRepository.findByStudentIdAndDate(studentId, date);
        existing.ifPresent(attendance -> {
            if (attendance.getStatus() == AttendanceStatus.ABSENT) {
                attendance.setStatus(AttendanceStatus.JUSTIFIED);
                attendanceRepository.save(attendance);
            }
        });

        return Mappers.justification(justification);
    }
}
