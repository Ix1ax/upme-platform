package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.ixlax.courseservice.domain.CourseReview;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseReviewRepository extends JpaRepository<CourseReview, UUID> {

    List<CourseReview> findAllByCourseIdOrderByCreatedAtDesc(UUID courseId);

    Optional<CourseReview> findByCourseIdAndUserId(UUID courseId, UUID userId);

    @Query("select avg(r.rating) from CourseReview r where r.course.id = :courseId")
    Double calculateAverageRating(UUID courseId);
}
