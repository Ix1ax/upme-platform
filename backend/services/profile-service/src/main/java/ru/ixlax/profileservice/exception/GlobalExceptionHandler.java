package ru.ixlax.profileservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex) {
        Map<String, Object> body = Map.<String, Object>of(
                "error", ex.getCode(),
                "message", ex.getMessage(),
                "status", ex.getStatus(),
                "timestamp", OffsetDateTime.now().toString()
        );
        return ResponseEntity.status(ex.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest req) {

        Map<String, String> validation = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() == null ? "Invalid value" : fe.getDefaultMessage(),
                        (a, b) -> a
                ));

        return build(HttpStatus.BAD_REQUEST, "Validation failed", req, validation, null, ex, false);
    }

    // Валидация параметров (@RequestParam/@PathVariable) через @Validated
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest req) {

        Map<String, String> validation = new HashMap<>();
        ex.getConstraintViolations().forEach(v -> {
            // propertyPath вроде "logout.refreshToken"
            String field = v.getPropertyPath() == null ? "param" : v.getPropertyPath().toString();
            validation.put(field, v.getMessage());
        });

        return build(HttpStatus.BAD_REQUEST, "Constraint violation", req, validation, null, ex, false);
    }

    // Ошибка биндинга (например, enum/число не распарсилось)
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiError> handleBindException(BindException ex, HttpServletRequest req) {
        Map<String, String> validation = ex.getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fe -> fe.getDefaultMessage() == null ? "Invalid value" : fe.getDefaultMessage(),
                        (a, b) -> a
                ));

        return build(HttpStatus.BAD_REQUEST, "Binding error", req, validation, null, ex, false);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleNotReadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "Malformed JSON request", req, null, null, ex, false);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingParam(MissingServletRequestParameterException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST,
                "Missing request parameter: " + ex.getParameterName(), req, null, null, ex, false);
    }

    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<ApiError> handleMissingPathVar(MissingPathVariableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST,
                "Missing path variable: " + ex.getVariableName(), req, null, null, ex, false);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        String msg = "Parameter '" + ex.getName() + "' must be of type " +
                (ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "expected");
        return build(HttpStatus.BAD_REQUEST, msg, req, null, null, ex, false);
    }

    // Твои бизнес-ошибки на 400 (например, бросаешь IllegalArgumentException)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null, "BAD_REQUEST", ex, false);
    }

    /* ==================== 401 / 403 ==================== */

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", req, null, "UNAUTHORIZED", ex, false);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "Access denied", req, null, "FORBIDDEN", ex, false);
    }

    /* ==================== 404 / 405 / 415 ==================== */

    // Если у тебя появится собственный NotFoundException — кинь его из сервисов
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req, null, "NOT_FOUND", ex, false);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex,
                                                             HttpServletRequest req) {
        Set<HttpMethod> supported = ex.getSupportedHttpMethods();
        String msg = "Method not allowed. Supported: " + (supported == null ? "[]" : supported);
        return build(HttpStatus.METHOD_NOT_ALLOWED, msg, req, null, null, ex, false);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleMediaType(HttpMediaTypeNotSupportedException ex, HttpServletRequest req) {
        return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported media type", req, null, null, ex, false);
    }

    /* ==================== 409 / 422 ==================== */

    // Нарушение уникальности, FK и т.п.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, "Data integrity violation", req, null, "DATA_INTEGRITY_VIOLATION", ex, true);
    }

    /* ==================== 500 fallback ==================== */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleAny(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error", req, null, "INTERNAL_ERROR", ex, true);
    }

    /* ==================== helpers ==================== */

    private ResponseEntity<ApiError> build(
            HttpStatus status,
            String message,
            HttpServletRequest req,
            Map<String, String> validation,
            String code,
            Exception ex,
            boolean logStacktrace
    ) {
        if (logStacktrace) {
            log.error("Handled: {} {} -> {}", req.getMethod(), req.getRequestURI(), ex.getMessage(), ex);
        } else {
            log.warn("Handled: {} {} -> {}", req.getMethod(), req.getRequestURI(), ex.getMessage());
        }

        ApiError body = ApiError.builder()
                .timestamp(OffsetDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(req.getRequestURI())
                .validation(validation == null || validation.isEmpty() ? null : validation)
                .code(code)
                .build();

        return ResponseEntity.status(status).body(body);
    }

    /* ============ Пример своей 404-ошибки ============ */
    public static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String msg) { super(msg); }
    }
}
