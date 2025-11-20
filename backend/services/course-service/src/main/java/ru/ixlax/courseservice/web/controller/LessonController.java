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
import ru.ixlax.courseservice.service.LessonService;
import ru.ixlax.courseservice.web.dto.LessonRequest;
import ru.ixlax.courseservice.web.dto.LessonResponse;

import java.util.List;
import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.PUBLIC;
import static ru.ixlax.courseservice.web.SwaggerRoleTags.TEACHER_ADMIN;

@Tag(name = "Lessons", description = "CRUD операций по урокам внутри курса")
@RestController
@RequestMapping("/api/courses/{courseId}/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessons;

    @Operation(summary = "Получить уроки курса", description = "Публично, если курс опубликован. Иначе доступно только автору/админу.")
    @Tag(name = PUBLIC)
    @GetMapping
    public ResponseEntity<List<LessonResponse>> getLessons(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID requester = jwt != null ? UUID.fromString(jwt.getSubject()) : null;
        boolean isAdmin = jwt != null && "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(lessons.getByCourse(courseId, requester, isAdmin));
    }

    @Operation(
            summary = "Создать урок",
            description = "Добавляет новый урок в курс. Порядок определяется orderIndex или очередностью.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<LessonResponse> create(
            @PathVariable UUID courseId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody LessonRequest request
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(lessons.create(courseId, authorId, isAdmin, request));
    }

    @Operation(
            summary = "Обновить урок",
            description = "Позволяет изменить заголовок, контент и порядок урока.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PatchMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<LessonResponse> update(
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody LessonRequest request
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(lessons.update(courseId, lessonId, authorId, isAdmin, request));
    }

    @Operation(
            summary = "Удалить урок",
            description = "Удаляет урок из курса. Доступно только автору/админу.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID courseId,
            @PathVariable UUID lessonId,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        lessons.delete(courseId, lessonId, authorId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
