package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "groups_")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false)
    private int grade;

    @Column(nullable = false, length = 4)
    private String letter;

    @Column(nullable = false, length = 40)
    private String name;

    @Column(nullable = false)
    private int studentCount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(nullable = false, length = 20)
    private String schoolYear;
}
