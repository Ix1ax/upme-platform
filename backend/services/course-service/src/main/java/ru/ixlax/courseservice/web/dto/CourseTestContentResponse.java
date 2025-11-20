package ru.ixlax.courseservice.web.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "DTO теста для студентов (без правильных ответов)")
public record CourseTestContentResponse(
        @Schema(description = "ID теста") UUID testId,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "Название теста") String title,
        @Schema(description = "Список вопросов без отметок correct") JsonNode questions,
        @Schema(description = "Минимум правильных ответов для прохождения") Integer passingScore
) {}
