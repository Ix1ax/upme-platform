package ru.ixlax.courseservice.web.dto;

public record CourseRequest(
        String title,
        String description,
        String structureJson
) {}

