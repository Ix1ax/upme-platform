package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Map;

@Schema(description = "Ответ студента на тест")
public record TestSubmissionRequest(
        @Schema(description = "Карта ответов. Ключ — id вопроса, значение — список выбранных ключей вариантов")
        @NotNull(message = "Ответы на тест не могут быть null")
        Map<String, List<String>> answers
) {}
