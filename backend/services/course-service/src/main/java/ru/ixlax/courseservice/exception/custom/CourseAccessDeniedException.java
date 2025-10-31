package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class CourseAccessDeniedException extends ApiException {
    public CourseAccessDeniedException(String message) {
        super("COURSE_ACCESS_DENIED", message, 403);
    }
}
