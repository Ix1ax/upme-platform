package ru.ixlax.courseservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ixlax.courseservice.domain.*;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.exception.custom.CourseNotPublishedException;
import ru.ixlax.courseservice.exception.custom.EnrollmentNotFoundException;
import ru.ixlax.courseservice.exception.custom.LessonNotFoundException;
import ru.ixlax.courseservice.service.EnrollmentService;
import ru.ixlax.courseservice.repository.*;
import ru.ixlax.courseservice.web.dto.CourseProgressResponse;
import ru.ixlax.courseservice.web.dto.EnrollmentResponse;
import ru.ixlax.courseservice.web.dto.TestAttemptResponse;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final LessonRepository lessons;
    private final LessonProgressRepository lessonProgress;
    private final CourseTestRepository courseTests;
    private final TestAttemptRepository testAttempts;

    @Override
    @Transactional
    public EnrollmentResponse enroll(UUID courseId, UUID userId) {
        requireUser(userId);
        Course course = findCourse(courseId);
        ensureCourseIsAvailable(course, userId);

        Enrollment enrollment = enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseGet(() -> Enrollment.builder()
                        .course(course)
                        .userId(userId)
                        .status(EnrollmentStatus.ACTIVE)
                        .progressPercent(0)
                        .build());

        enrollment.setCourse(course);
        enrollment.setUserId(userId);

        if (enrollment.getStatus() == EnrollmentStatus.CANCELLED) {
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollment.setCompletedAt(null);
        }
        if (enrollment.getProgressPercent() == null) {
            enrollment.setProgressPercent(0);
        }

        enrollments.save(enrollment);
        return EnrollmentResponse.from(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public EnrollmentResponse getEnrollment(UUID courseId, UUID userId) {
        requireUser(userId);
        Enrollment enrollment = enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Запись на курс не найдена"));
        return EnrollmentResponse.from(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getMyEnrollments(UUID userId) {
        requireUser(userId);
        return enrollments.findAllByUserId(userId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public CourseProgressResponse getProgress(UUID courseId, UUID userId) {
        requireUser(userId);
        Enrollment enrollment = enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Запись на курс не найдена"));

        ProgressSnapshot snapshot = refreshEnrollmentProgress(enrollment);
        enrollments.save(enrollment);
        return buildProgressResponse(enrollment, snapshot);
    }

    @Override
    @Transactional
    public CourseProgressResponse completeLesson(UUID courseId, UUID lessonId, UUID userId) {
        requireUser(userId);
        Enrollment enrollment = enrollments.findByCourseIdAndUserId(courseId, userId)
                .orElseThrow(() -> new EnrollmentNotFoundException("Сначала запишитесь на курс"));

        Lesson lesson = lessons.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new LessonNotFoundException(lessonId.toString()));

        LessonProgress progress = lessonProgress.findByEnrollmentIdAndLessonId(enrollment.getId(), lesson.getId())
                .orElseGet(() -> LessonProgress.builder()
                        .enrollment(enrollment)
                        .lesson(lesson)
                        .status(LessonProgressStatus.IN_PROGRESS)
                        .build());

        progress.setEnrollment(enrollment);
        progress.setLesson(lesson);
        progress.setStatus(LessonProgressStatus.COMPLETED);
        progress.setCompletedAt(OffsetDateTime.now());
        lessonProgress.save(progress);

        ProgressSnapshot snapshot = refreshEnrollmentProgress(enrollment);
        enrollments.save(enrollment);
        return buildProgressResponse(enrollment, snapshot);
    }

    private CourseProgressResponse buildProgressResponse(Enrollment enrollment, ProgressSnapshot snapshot) {
        UUID courseId = enrollment.getCourse().getId();
        UUID lastCompletedLessonId = lessonProgress
                .findTopByEnrollmentIdAndStatusOrderByCompletedAtDescCreatedAtDesc(
                        enrollment.getId(),
                        LessonProgressStatus.COMPLETED
                )
                .map(lp -> lp.getLesson().getId())
                .orElse(null);

        TestAttemptResponse attemptResponse = null;
        boolean testAvailable = false;
        var test = courseTests.findByCourseId(courseId);
        if (test.isPresent()) {
            testAvailable = true;
            attemptResponse = testAttempts.findTopByTestIdAndUserIdOrderByCreatedAtDesc(test.get().getId(), enrollment.getUserId())
                    .map(TestAttemptResponse::from)
                    .orElse(null);
        }

        return new CourseProgressResponse(
                courseId,
                enrollment.getUserId(),
                enrollment.getStatus(),
                snapshot.completedLessons(),
                snapshot.totalLessons(),
                snapshot.percent(),
                lastCompletedLessonId,
                enrollment.getUpdatedAt(),
                attemptResponse,
                testAvailable
        );
    }

    private ProgressSnapshot refreshEnrollmentProgress(Enrollment enrollment) {
        int totalLessons = Math.toIntExact(lessons.countByCourseId(enrollment.getCourse().getId()));
        int completedLessons = (int) lessonProgress.countByEnrollmentIdAndStatus(
                enrollment.getId(),
                LessonProgressStatus.COMPLETED
        );
        int percent = totalLessons == 0
                ? 0
                : (int) Math.round((double) completedLessons * 100 / totalLessons);

        enrollment.setProgressPercent(percent);

        if (totalLessons > 0 && completedLessons >= totalLessons) {
            enrollment.setStatus(EnrollmentStatus.COMPLETED);
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(OffsetDateTime.now());
            }
        } else if (percent < 100 && enrollment.getStatus() == EnrollmentStatus.COMPLETED) {
            enrollment.setStatus(EnrollmentStatus.ACTIVE);
            enrollment.setCompletedAt(null);
        }

        return new ProgressSnapshot(completedLessons, totalLessons, percent);
    }

    private Course findCourse(UUID id) {
        return courses.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }

    private void ensureCourseIsAvailable(Course course, UUID userId) {
        if (course.isPublished()) {
            return;
        }
        if (userId != null && course.getAuthorId() != null && course.getAuthorId().equals(userId)) {
            return;
        }
        throw new CourseNotPublishedException("Курс ещё не опубликован");
    }

    private void requireUser(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
    }

    private record ProgressSnapshot(int completedLessons, int totalLessons, int percent) {}
}
