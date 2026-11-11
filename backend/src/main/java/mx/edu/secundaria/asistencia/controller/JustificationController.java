package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.JustificationDto;
import mx.edu.secundaria.asistencia.model.JustificationReason;
import mx.edu.secundaria.asistencia.service.JustificationService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/justifications")
public class JustificationController {

    private final JustificationService justificationService;

    public JustificationController(JustificationService justificationService) {
        this.justificationService = justificationService;
    }

    @GetMapping
    public List<JustificationDto> getJustifications() {
        return justificationService.getJustifications();
    }

    @PostMapping(consumes = "multipart/form-data")
    public JustificationDto createJustification(
        @RequestParam String studentId,
        @RequestParam String date,
        @RequestParam JustificationReason reason,
        @RequestParam(required = false) String notes,
        @RequestParam(required = false) MultipartFile file
    ) {
        return justificationService.createJustification(studentId, date, reason, notes, file);
    }
}
