package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Автор курса для выпадающих списков/фильтров")
public record CourseAuthorResponse(
        @Schema(description = "ID автора (UUID пользователя из auth-service)") UUID id,
        @Schema(description = "Отображаемое имя автора") String name,
        @Schema(description = "Сколько опубликованных курсов у автора") long coursesCount
) {}
