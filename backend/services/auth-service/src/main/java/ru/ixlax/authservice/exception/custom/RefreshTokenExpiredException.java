package ru.ixlax.authservice.exception.custom;

import ru.ixlax.authservice.exception.ApiException;

public class RefreshTokenExpiredException extends ApiException {
    public RefreshTokenExpiredException(String message) {
        super("TOKEN_EXPIRED", message, 401);
    }
}
