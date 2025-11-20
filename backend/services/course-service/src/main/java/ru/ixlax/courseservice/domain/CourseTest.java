package ru.ixlax.courseservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_tests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseTest {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", unique = true)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(name = "questions_json", columnDefinition = "TEXT", nullable = false)
    private String questionsJson;

    @Column(name = "passing_score")
    private Integer passingScore;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
