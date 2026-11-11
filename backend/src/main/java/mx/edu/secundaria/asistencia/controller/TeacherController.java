package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.TeacherDto;
import mx.edu.secundaria.asistencia.service.TeacherService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public List<TeacherDto> getTeachers() {
        return teacherService.getTeachers();
    }
}
