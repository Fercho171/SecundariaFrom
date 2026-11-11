package mx.edu.secundaria.asistencia.service;

import mx.edu.secundaria.asistencia.dto.GroupDto;
import mx.edu.secundaria.asistencia.dto.StudentDto;
import mx.edu.secundaria.asistencia.exception.ApiException;
import mx.edu.secundaria.asistencia.model.Group;
import mx.edu.secundaria.asistencia.repository.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class GroupService {

    private final GroupRepository groupRepository;
    private final StudentService studentService;

    public GroupService(GroupRepository groupRepository, StudentService studentService) {
        this.groupRepository = groupRepository;
        this.studentService = studentService;
    }

    public List<GroupDto> getGroups() {
        return groupRepository.findAllByOrderByGradeAscLetterAsc().stream().map(Mappers::group).toList();
    }

    public Group requireGroup(String id) {
        return groupRepository.findById(id)
            .orElseThrow(() -> ApiException.notFound("No se encontró el grupo."));
    }

    public GroupDto getGroup(String id) {
        return Mappers.group(requireGroup(id));
    }

    public List<StudentDto> getGroupStudents(String id) {
        requireGroup(id);
        return studentService.getStudents(null, id);
    }
}
