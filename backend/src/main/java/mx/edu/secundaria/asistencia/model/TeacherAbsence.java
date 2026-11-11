package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teacher_absences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAbsence {

    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Weekday weekday;

    @Column(nullable = false, length = 160)
    private String reason;

    @Column(length = 240)
    private String coveredBy;

    @ElementCollection
    @CollectionTable(name = "teacher_absence_periods", joinColumns = @JoinColumn(name = "teacher_absence_id"))
    @Column(name = "period_id")
    private List<Integer> affectedPeriods = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "teacher_absence_groups", joinColumns = @JoinColumn(name = "teacher_absence_id"))
    @Column(name = "group_name")
    private List<String> affectedGroups = new ArrayList<>();
}
