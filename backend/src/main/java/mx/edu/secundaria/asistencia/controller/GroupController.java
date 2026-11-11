package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.GroupDto;
import mx.edu.secundaria.asistencia.dto.StudentDto;
import mx.edu.secundaria.asistencia.service.GroupService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @GetMapping
    public List<GroupDto> getGroups() {
        return groupService.getGroups();
    }

    @GetMapping("/{id}")
    public GroupDto getGroup(@PathVariable String id) {
        return groupService.getGroup(id);
    }

    @GetMapping("/{id}/students")
    public List<StudentDto> getGroupStudents(@PathVariable String id) {
        return groupService.getGroupStudents(id);
    }
}
