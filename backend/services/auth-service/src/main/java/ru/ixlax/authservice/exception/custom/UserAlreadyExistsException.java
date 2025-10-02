package ru.ixlax.authservice.exception.custom;

import ru.ixlax.authservice.exception.ApiException;

public class UserAlreadyExistsException extends ApiException {
    public UserAlreadyExistsException(String email) {
        super("USER_ALREADY_EXISTS", "Email уже используется " + email, 409);
    }
}
