package ru.ixlax.courseservice.service;

import ru.ixlax.courseservice.web.dto.CourseReviewRequest;
import ru.ixlax.courseservice.web.dto.CourseReviewResponse;

import java.util.List;
import java.util.UUID;

public interface CourseReviewService {

    List<CourseReviewResponse> getReviews(UUID courseId);

    CourseReviewResponse upsertReview(UUID courseId, UUID userId, CourseReviewRequest request);
}
