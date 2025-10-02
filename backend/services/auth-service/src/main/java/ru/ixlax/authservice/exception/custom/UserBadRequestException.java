package ru.ixlax.authservice.exception.custom;

import ru.ixlax.authservice.exception.ApiException;

public class UserBadRequestException extends ApiException {
    public UserBadRequestException(String message) {
        super("USER_BAD_REQUEST", message, 400);
    }
}
