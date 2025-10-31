package ru.ixlax.courseservice.web.dto;

import ru.ixlax.courseservice.domain.Course;

public record CourseResponse(
        String id,
        String title,
        String description,
        String previewUrl,
        String structureUrl,
        boolean published,
        Double rating
) {
    public static CourseResponse from(Course c) {
        return new CourseResponse(
                c.getId().toString(),
                c.getTitle(),
                c.getDescription(),
                c.getPreviewUrl(),
                c.getStructureUrl(),
                c.isPublished(),
                c.getRating()
        );
    }
}
