package ru.ixlax.courseservice.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import ru.ixlax.courseservice.service.CourseTestService;
import ru.ixlax.courseservice.web.dto.*;

import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.STUDENT;
import static ru.ixlax.courseservice.web.SwaggerRoleTags.TEACHER_ADMIN;

@Tag(name = "Course Tests", description = "Создание и прохождение итоговых тестов по курсу")
@RestController
@RequestMapping("/api/courses/{courseId}/test")
@RequiredArgsConstructor
public class CourseTestController {

    private final CourseTestService tests;

    @Operation(
            summary = "Создать/обновить тест",
            description = "Принимает JSON с вопросами/ответами. Доступно автору курса или админу.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseTestResponse> createOrUpdate(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CourseTestRequest request
    ) {
        UUID authorId = requireUser(jwt);
        boolean isAdmin = isAdmin(jwt);
        return ResponseEntity.ok(tests.createOrUpdate(courseId, authorId, isAdmin, request));
    }

    @Operation(
            summary = "Получить тест для редактирования",
            description = "Возвращает полную структуру теста вместе с правильными ответами.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @GetMapping("/manage")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseTestResponse> getForManage(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID authorId = requireUser(jwt);
        boolean isAdmin = isAdmin(jwt);
        return ResponseEntity.ok(tests.getForManage(courseId, authorId, isAdmin));
    }

    @Operation(
            summary = "Получить тест для прохождения",
            description = "Возвращает вопросы без отметки правильных ответов. Требует записи на курс.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseTestContentResponse> getForPassing(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(tests.getForPassing(courseId, userId));
    }

    @Operation(
            summary = "Отправить ответы теста",
            description = "Подсчитывает количество правильных ответов, возвращает TestAttemptResponse.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TestAttemptResponse> submit(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TestSubmissionRequest submission
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(tests.submit(courseId, userId, submission));
    }

    @Operation(
            summary = "Последняя попытка теста",
            description = "Возвращает результаты последней сдачи конкретного пользователя.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @GetMapping("/attempts/latest")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TestAttemptResponse> latestAttempt(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(tests.getLatestAttempt(courseId, userId));
    }

    private UUID requireUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
        return UUID.fromString(jwt.getSubject());
    }

    private boolean isAdmin(Jwt jwt) {
        return jwt != null && "ADMIN".equals(jwt.getClaimAsString("role"));
    }
}
