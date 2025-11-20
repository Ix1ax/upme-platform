package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.courseservice.domain.LessonProgress;
import ru.ixlax.courseservice.domain.LessonProgressStatus;

import java.util.Optional;
import java.util.UUID;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(UUID enrollmentId, UUID lessonId);
    long countByEnrollmentIdAndStatus(UUID enrollmentId, LessonProgressStatus status);
    Optional<LessonProgress> findTopByEnrollmentIdAndStatusOrderByCompletedAtDescCreatedAtDesc(
            UUID enrollmentId,
            LessonProgressStatus status
    );
}
