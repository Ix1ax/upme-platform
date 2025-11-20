package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.courseservice.domain.Lesson;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findAllByCourseIdOrderByOrderIndexAscCreatedAtAsc(UUID courseId);
    Optional<Lesson> findByIdAndCourseId(UUID id, UUID courseId);
    long countByCourseId(UUID courseId);
}
