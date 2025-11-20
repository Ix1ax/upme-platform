package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class EnrollmentNotFoundException extends ApiException {
    public EnrollmentNotFoundException(String message) {
        super("ENROLLMENT_NOT_FOUND", message, 404);
    }
}
