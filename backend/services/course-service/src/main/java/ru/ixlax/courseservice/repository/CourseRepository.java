package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import ru.ixlax.courseservice.domain.Course;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> getAllByPublishedTrue();
    List<Course> getAllByAuthorId(UUID authorId);
    boolean existsByIdAndAuthorId(UUID courseID, UUID authorId);
}
