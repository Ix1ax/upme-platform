package ru.ixlax.courseservice.web.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на создание/редактирование урока")
public record LessonRequest(
        @Schema(description = "Название урока", example = "Введение в Git")
        @NotBlank String title,
        @Schema(description = "Структура урока в произвольном JSON формате")
        @NotNull JsonNode content,
        @Schema(description = "Порядок отображения. Если null — ставим в конец") Integer orderIndex
) {}
