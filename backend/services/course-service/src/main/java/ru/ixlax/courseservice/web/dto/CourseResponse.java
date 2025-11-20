package ru.ixlax.courseservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.courseservice.domain.Course;

import java.util.UUID;

@Schema(description = "Карточка курса в каталоге/кабинете")
public record CourseResponse(
        @Schema(description = "ID курса") UUID id,
        @Schema(description = "Название курса") String title,
        @Schema(description = "Краткое описание") String description,
        @Schema(description = "URL превью/обложки") String previewUrl,
        @Schema(description = "URL JSON-файла со структурой") String structureUrl,
        @Schema(description = "URL JSON-файла с уроками") String lessonsUrl,
        @Schema(description = "Флаг публикации") boolean published,
        @Schema(description = "Средняя оценка студентов") Double rating
) {
    public static CourseResponse from(Course c) {
        return new CourseResponse(
                c.getId(),
                c.getTitle(),
                c.getDescription(),
                c.getPreviewUrl(),
                c.getStructureUrl(),
                c.getLessonsUrl(),
                c.isPublished(),
                c.getRating()
        );
    }
}
