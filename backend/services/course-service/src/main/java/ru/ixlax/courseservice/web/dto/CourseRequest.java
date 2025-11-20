package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Запрос на создание/редактирование курса")
public record CourseRequest(
        @Schema(description = "Название курса", example = "Git с нуля")
        @NotBlank String title,
        @Schema(description = "Краткое описание, отображается в каталоге", example = "10 уроков, 2 часа практики")
        String description
) {}
