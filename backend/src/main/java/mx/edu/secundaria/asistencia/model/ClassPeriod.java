package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "class_periods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassPeriod {

    @Id
    private Integer id;

    @Column(nullable = false, length = 10)
    private String label;

    @Column(nullable = false, length = 8)
    private String startTime;

    @Column(nullable = false, length = 8)
    private String endTime;
}
