package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class LessonNotFoundException extends ApiException {
    public LessonNotFoundException(String message) {
        super("LESSON_NOT_FOUND", message, 404);
    }
}
