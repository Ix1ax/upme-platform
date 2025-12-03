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
import ru.ixlax.courseservice.service.CourseReviewService;
import ru.ixlax.courseservice.web.dto.CourseReviewRequest;
import ru.ixlax.courseservice.web.dto.CourseReviewResponse;

import java.util.List;
import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.STUDENT;

@Tag(name = "Course Reviews", description = "Отзывы и рейтинги курсов")
@RestController
@RequestMapping("/api/courses/{courseId}/reviews")
@RequiredArgsConstructor
public class CourseReviewController {

    private final CourseReviewService reviews;

    @Operation(
            summary = "Список отзывов курса",
            description = "Возвращает все отзывы по курсу, отсортированные от новых к старым."
    )
    @GetMapping
    public ResponseEntity<List<CourseReviewResponse>> getReviews(@PathVariable UUID courseId) {
        return ResponseEntity.ok(reviews.getReviews(courseId));
    }

    @Operation(
            summary = "Оставить/обновить отзыв о курсе",
            description = "Доступно только после завершения курса на 100%. Повторный вызов обновляет отзыв.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = STUDENT)
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CourseReviewResponse> addReview(
            @PathVariable UUID courseId,
            @Valid @RequestBody CourseReviewRequest request,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(reviews.upsertReview(courseId, userId, request));
    }

    private UUID requireUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
        return UUID.fromString(jwt.getSubject());
    }
}
