package ru.ixlax.courseservice.web.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "DTO теста курса (с правильными ответами)")
public record CourseTestResponse(
        @Schema(description = "ID теста") UUID id,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "Название теста") String title,
        @Schema(description = "JSON с вопросами и правильными ответами") JsonNode questions,
        @Schema(description = "Минимальное число правильных ответов для зачета") Integer passingScore
) {}
