package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.courseservice.domain.CourseTest;

import java.util.Optional;
import java.util.UUID;

public interface CourseTestRepository extends JpaRepository<CourseTest, UUID> {
    Optional<CourseTest> findByCourseId(UUID courseId);
}
