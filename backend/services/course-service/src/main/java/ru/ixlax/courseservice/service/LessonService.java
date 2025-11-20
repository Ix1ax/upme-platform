package ru.ixlax.courseservice.service;

import ru.ixlax.courseservice.web.dto.LessonRequest;
import ru.ixlax.courseservice.web.dto.LessonResponse;

import java.util.List;
import java.util.UUID;

public interface LessonService {

    LessonResponse create(UUID courseId, UUID authorId, boolean isAdmin, LessonRequest request);

    List<LessonResponse> getByCourse(UUID courseId, UUID requesterId, boolean isAdmin);

    LessonResponse update(UUID courseId, UUID lessonId, UUID authorId, boolean isAdmin, LessonRequest request);

    void delete(UUID courseId, UUID lessonId, UUID authorId, boolean isAdmin);
}
