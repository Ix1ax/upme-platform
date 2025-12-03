package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class CourseReviewNotAllowedException extends ApiException {
    public CourseReviewNotAllowedException(String message) {
        super("REVIEW_NOT_ALLOWED", message, 400);
    }
}
