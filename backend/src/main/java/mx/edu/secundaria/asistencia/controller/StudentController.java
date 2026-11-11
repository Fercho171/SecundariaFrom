package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.StudentDto;
import mx.edu.secundaria.asistencia.dto.StudentProfileDto;
import mx.edu.secundaria.asistencia.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public List<StudentDto> getStudents(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String groupId
    ) {
        return studentService.getStudents(search, groupId);
    }

    @GetMapping("/{id}")
    public StudentProfileDto getStudent(@PathVariable String id) {
        return studentService.getStudent(id);
    }
}
