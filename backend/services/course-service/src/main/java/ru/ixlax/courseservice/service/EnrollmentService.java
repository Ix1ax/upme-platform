package ru.ixlax.courseservice.service;

import ru.ixlax.courseservice.web.dto.CourseProgressResponse;
import ru.ixlax.courseservice.web.dto.EnrollmentResponse;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {
    EnrollmentResponse enroll(UUID courseId, UUID userId);
    EnrollmentResponse getEnrollment(UUID courseId, UUID userId);
    CourseProgressResponse getProgress(UUID courseId, UUID userId);
    CourseProgressResponse completeLesson(UUID courseId, UUID lessonId, UUID userId);
    List<EnrollmentResponse> getMyEnrollments(UUID userId);
}
