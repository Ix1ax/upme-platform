package ru.ixlax.courseservice.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.ixlax.courseservice.service.EnrollmentService;
import ru.ixlax.courseservice.web.dto.EnrollmentResponse;

import java.util.List;
import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.STUDENT;

@Tag(name = "Enrollments", description = "Сервисные ручки для списка курсов студента")
@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollments;

    @Operation(
            summary = "Мои записи на курсы",
            description = "Возвращает список всех курсов, на которые записан пользователь.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EnrollmentResponse>> myEnrollments(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(enrollments.getMyEnrollments(userId));
    }

    private UUID requireUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
        return UUID.fromString(jwt.getSubject());
    }
}
