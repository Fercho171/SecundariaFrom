package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, unique = true)
    private int studentNumber;

    @Column(nullable = false, length = 120)
    private String firstName;

    @Column(nullable = false, length = 120)
    private String lastName;

    @Column(nullable = false, length = 240)
    private String fullName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status;

    @Column(nullable = false, length = 20)
    private String schoolYear;

    // Nota: los conteos (asistencias, faltas, retardos, justificados, %)
    // se calculan siempre a partir de la tabla attendances (ver AttendanceRepository),
    // no se guardan aquí para evitar que queden desincronizados.
}
