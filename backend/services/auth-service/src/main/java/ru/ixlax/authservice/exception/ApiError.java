package ru.ixlax.authservice.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Value;

import java.time.OffsetDateTime;
import java.util.Map;

@Value
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    OffsetDateTime timestamp;
    int status;             // HTTP status code
    String error;           // reason phrase (e.g., "Bad Request")
    String message;         // human-readable message
    String path;            // request path
    Map<String, String> validation; // field -> message (для валидации)
    String code;            // опциональный бизнес-код ошибки
}