package mx.edu.secundaria.asistencia.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "cover_assignments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CoverAssignment {

    @Id
    @Column(length = 40)
    private String id;

    @Column(nullable = false, length = 240)
    private String title;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Weekday weekday;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private ClassPeriod period;

    @Column(nullable = false, length = 80)
    private String subject;

    @Column(length = 240)
    private String absentTeacherName;

    @Column(length = 4000)
    private String instructions;

    @Column(nullable = false, length = 255)
    private String fileName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CoverFileType fileType;

    @Column(length = 120)
    private String fileContentType;

    @Lob
    @Column(name = "file_data", nullable = false)
    private byte[] fileData;

    @Column(nullable = false)
    private Instant createdAt;
}
