package ru.ixlax.courseservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ixlax.courseservice.domain.Course;
import ru.ixlax.courseservice.domain.CourseReview;
import ru.ixlax.courseservice.domain.Enrollment;
import ru.ixlax.courseservice.domain.EnrollmentStatus;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.exception.custom.CourseReviewNotAllowedException;
import ru.ixlax.courseservice.exception.custom.EnrollmentNotFoundException;
import ru.ixlax.courseservice.repository.CourseRepository;
import ru.ixlax.courseservice.repository.CourseReviewRepository;
import ru.ixlax.courseservice.repository.EnrollmentRepository;
import ru.ixlax.courseservice.service.CourseReviewService;
import ru.ixlax.courseservice.web.dto.CourseReviewRequest;
import ru.ixlax.courseservice.web.dto.CourseReviewResponse;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseReviewServiceImpl implements CourseReviewService {

    private final CourseRepository courses;
    private final CourseReviewRepository reviews;
    private final EnrollmentRepository enrollments;

    @Override
    @Transactional(readOnly = true)
    public List<CourseReviewResponse> getReviews(UUID courseId) {
        if (!courses.existsById(courseId)) {
            throw new CourseNotFoundException(courseId.toString());
        }
        return reviews.findAllByCourseIdOrderByCreatedAtDesc(courseId).stream()
                .map(CourseReviewResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CourseReviewResponse upsertReview(UUID courseId, UUID userId, CourseReviewRequest request) {
        requireUser(userId);
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(courseId.toString()));

        Enrollment enrollment = enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Запишитесь и завершите курс, чтобы оставить отзыв"));

        ensureCompleted(enrollment);

        CourseReview review = reviews.findByCourseIdAndUserId(courseId, userId)
                .orElseGet(() -> CourseReview.builder()
                        .course(course)
                        .userId(userId)
                        .build());

        review.setCourse(course);
        review.setUserId(userId);
        review.setRating(request.rating());
        review.setComment(request.comment());

        CourseReview saved = reviews.save(review);
        updateCourseRating(course);
        return CourseReviewResponse.from(saved);
    }

    private void updateCourseRating(Course course) {
        Double avg = reviews.calculateAverageRating(course.getId());
        course.setRating(avg == null ? 0.0 : avg);
        courses.save(course);
    }

    private void ensureCompleted(Enrollment enrollment) {
        boolean completed = enrollment.getStatus() == EnrollmentStatus.COMPLETED
                || (enrollment.getProgressPercent() != null && enrollment.getProgressPercent() >= 100);
        if (!completed) {
            throw new CourseReviewNotAllowedException("Завершите курс на 100%, чтобы оставить отзыв");
        }
    }

    private void requireUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
    }
}
