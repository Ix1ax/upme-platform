package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Фильтры и сортировка каталога курсов")
public record CatalogFilter(
        @Schema(description = "Поиск по названию и описанию (substring, case-insensitive)", example = "python")
        String query,
        @Schema(description = "Фильтр по автору курса (UUID преподавателя)", example = "2f8b4c0e-1a2b-4c3d-9e4f-567890abcdef")
        UUID authorId,
        @Schema(description = "Минимальный рейтинг (>=)", example = "4.5")
        Double minRating,
        @Schema(description = "Сортировка: rating_desc (по умолчанию), rating_asc, newest, oldest", example = "newest", defaultValue = "rating_desc")
        String sort
) {
}
