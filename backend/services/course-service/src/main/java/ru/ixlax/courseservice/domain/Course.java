package ru.ixlax.courseservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    @GeneratedValue
    private UUID id;

    private String title;

    @Column(length = 2000)
    private String description;

    private UUID authorId;

    private String previewUrl;     // ссылка на изображение превью
    private String structureUrl;   // JSON «скелет» (structure.json)
    private String lessonsUrl;     // JSON «контент» (lessons.json)

    private Double rating;
    private boolean published;

    @Column(name = "created_at")
    @CreationTimestamp
    private OffsetDateTime createdAt;
    @Column(name = "updated_at")
    @UpdateTimestamp
    private OffsetDateTime updatedAt;

}