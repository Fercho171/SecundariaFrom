package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.TeacherDto;
import mx.edu.secundaria.asistencia.model.Teacher;
import mx.edu.secundaria.asistencia.repository.GroupRepository;
import mx.edu.secundaria.asistencia.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final GroupRepository groupRepository;

    public TeacherService(TeacherRepository teacherRepository, GroupRepository groupRepository) {
        this.teacherRepository = teacherRepository;
        this.groupRepository = groupRepository;
    }

    public List<TeacherDto> getTeachers() {
        return teacherRepository.findAll().stream()
            .map(t -> Mappers.teacher(t, groupIdsOf(t)))
            .toList();
    }

    public Teacher requireTeacher(String id) {
        return teacherRepository.findById(id)
            .orElseThrow(() -> mx.edu.secundaria.asistencia.exception.ApiException.notFound("No se encontró el docente."));
    }

    private List<String> groupIdsOf(Teacher teacher) {
        return groupRepository.findByTeacherIdOrderByGradeAscLetterAsc(teacher.getId()).stream()
            .map(mx.edu.secundaria.asistencia.model.Group::getId)
            .toList();
    }
}
