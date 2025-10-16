package ru.ixlax.profileservice.exception.custom;

import org.springframework.http.HttpStatus;
import ru.ixlax.profileservice.exception.ApiException;

public class ProfileNotFoundException extends ApiException {
    public ProfileNotFoundException(String message) {
        super("PROFILE_NOT_FOUND", message, 404);
    }
}
