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
import org.springframework.web.bind.annotation.*;
import ru.ixlax.courseservice.service.EnrollmentService;
import ru.ixlax.courseservice.web.dto.CourseProgressResponse;
import ru.ixlax.courseservice.web.dto.EnrollmentResponse;

import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.STUDENT;

@Tag(name = "Learning", description = "Запись на курс, прогресс уроков и отметки о прохождении")
@RestController
@RequestMapping("/api/courses/{courseId}")
@RequiredArgsConstructor
public class CourseLearningController {

    private final EnrollmentService enrollments;

    @Operation(
            summary = "Записаться на курс",
            description = "Создает или восстанавливает запись пользователя на курс.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @PostMapping("/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EnrollmentResponse> enroll(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(enrollments.enroll(courseId, userId));
    }

    @Operation(
            summary = "Получить статус записи",
            description = "Возвращает EnrollmentResponse либо 404, если пользователь ещё не записывался.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @GetMapping("/enrollment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EnrollmentResponse> getEnrollment(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(enrollments.getEnrollment(courseId, userId));
    }

    @Operation(
            summary = "Прогресс по урокам",
            description = "Возвращает количество завершенных уроков, % прогресса и последние попытки теста.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @GetMapping("/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseProgressResponse> getProgress(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(enrollments.getProgress(courseId, userId));
    }

    @Operation(
            summary = "Отметить урок пройденным",
            description = "Ставит COMPLETED для урока и пересчитывает прогресс курса.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseProgressResponse> completeLesson(
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(enrollments.completeLesson(courseId, lessonId, userId));
    }

    private UUID requireUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
        return UUID.fromString(jwt.getSubject());
    }
}
