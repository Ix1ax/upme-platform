package ru.ixlax.courseservice.exception.custom;

import ru.ixlax.courseservice.exception.ApiException;

public class TestAttemptNotFoundException extends ApiException {
    public TestAttemptNotFoundException(String message) {
        super("TEST_ATTEMPT_NOT_FOUND", message, 404);
    }
}
