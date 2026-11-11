package mx.edu.secundaria.asistencia.controller;

import mx.edu.secundaria.asistencia.dto.AlertStudentDto;
import mx.edu.secundaria.asistencia.dto.DashboardDto;
import mx.edu.secundaria.asistencia.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public DashboardDto getDashboard() {
        return dashboardService.getDashboard();
    }

    @GetMapping("/alerts")
    public List<AlertStudentDto> getAlerts() {
        return dashboardService.getAlerts();
    }
}
