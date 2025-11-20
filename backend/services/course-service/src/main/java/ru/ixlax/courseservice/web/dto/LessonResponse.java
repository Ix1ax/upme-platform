package ru.ixlax.courseservice.web.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "DTO урока, возвращаемая фронту")
public record LessonResponse(
        @Schema(description = "ID урока") UUID id,
        @Schema(description = "ID курса") UUID courseId,
        @Schema(description = "Название урока") String title,
        @Schema(description = "Контент урока в JSON формате") JsonNode content,
        @Schema(description = "Порядок сортировки") Integer orderIndex
) {}
