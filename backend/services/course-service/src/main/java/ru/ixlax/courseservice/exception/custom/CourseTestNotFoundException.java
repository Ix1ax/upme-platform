package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class CourseTestNotFoundException extends ApiException {
    public CourseTestNotFoundException(String message) {
        super("COURSE_TEST_NOT_FOUND", message, 404);
    }
}
