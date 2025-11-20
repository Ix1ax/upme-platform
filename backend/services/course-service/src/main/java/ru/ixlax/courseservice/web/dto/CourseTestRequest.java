package ru.ixlax.courseservice.web.dto;

import com.fasterxml.jackson.databind.JsonNode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Запрос на создание или обновление теста курса")
public record CourseTestRequest(
        @Schema(description = "Название теста", example = "Финальная проверка знаний")
        @NotBlank(message = "Название теста обязательно")
        String title,
        @Schema(description = """
                Массив вопросов. Каждый вопрос содержит id, title, multiple (bool) и массив options \
                (key,label,correct).""")
        @NotNull(message = "Список вопросов обязателен")
        JsonNode questions,
        @Schema(description = "Сколько вопросов нужно решить верно для прохождения. По умолчанию = количеству вопросов.")
        @Min(value = 0, message = "Порог прохождения не может быть меньше нуля")
        Integer passingScore
) {}
