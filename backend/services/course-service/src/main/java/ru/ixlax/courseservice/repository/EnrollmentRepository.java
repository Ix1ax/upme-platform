package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.courseservice.domain.Enrollment;
import ru.ixlax.courseservice.domain.EnrollmentStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    Optional<Enrollment> findByCourseIdAndUserId(UUID courseId, UUID userId);
    List<Enrollment> findAllByUserId(UUID userId);
    long countByCourseIdAndStatus(UUID courseId, EnrollmentStatus status);
}
