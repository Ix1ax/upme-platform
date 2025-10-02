package ru.ixlax.authservice.exception;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final String code;
    private final int status;

    public ApiException(String code, String message, int status) {
        super(message);
        this.code = code;
        this.status = status;
    }

}
