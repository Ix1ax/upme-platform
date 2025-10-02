package ru.ixlax.authservice.exception.custom;

import ru.ixlax.authservice.exception.ApiException;

public class RefreshTokenBadRequest extends ApiException {
    public RefreshTokenBadRequest(String message) {
        super("REFRESH_TOKEN_BAD_REQUEST", message, 400);
    }
}
