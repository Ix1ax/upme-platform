package ru.ixlax.courseservice.repository.projection;

import java.util.UUID;

public interface AuthorAggregation {
    UUID getAuthorId();
    long getCoursesCount();
}
