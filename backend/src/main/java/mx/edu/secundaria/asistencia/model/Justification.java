package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "justifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Justification {

    @Id
    @Column(length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private JustificationReason reason;

    @Column(nullable = false, length = 2000)
    private String notes;

    @Column(length = 255)
    private String fileName;

    @Lob
    @Column(name = "file_data")
    private byte[] fileData;

    @Column(length = 120)
    private String fileContentType;

    @Column(nullable = false)
    private Instant createdAt;
}
