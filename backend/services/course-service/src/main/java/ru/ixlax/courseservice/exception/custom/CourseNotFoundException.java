package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class CourseNotFoundException extends ApiException {
    public CourseNotFoundException(String message) {
        super("COURSE_NOT_FOUND", message, 404);
    }
}
