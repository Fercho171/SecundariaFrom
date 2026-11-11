package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "teachers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Teacher {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 120)
    private String firstName;

    @Column(nullable = false, length = 120)
    private String lastName;

    @Column(nullable = false, length = 240)
    private String fullName;

    @Column(nullable = false, length = 160, unique = true)
    private String email;

    @Column(nullable = false, length = 80)
    private String subject;

    @Column(nullable = false)
    private int contractedHours;
}
