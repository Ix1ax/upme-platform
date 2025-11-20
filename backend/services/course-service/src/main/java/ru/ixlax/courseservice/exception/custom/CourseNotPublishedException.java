package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class CourseNotPublishedException extends ApiException {
    public CourseNotPublishedException(String message) {
        super("COURSE_NOT_PUBLISHED", message, 403);
    }
}
