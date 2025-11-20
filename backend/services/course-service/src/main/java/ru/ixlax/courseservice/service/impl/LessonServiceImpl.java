package ru.ixlax.courseservice.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.ixlax.courseservice.domain.Course;
import ru.ixlax.courseservice.domain.Lesson;
import ru.ixlax.courseservice.exception.custom.CourseAccessDeniedException;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.exception.custom.LessonNotFoundException;
import ru.ixlax.courseservice.repository.CourseRepository;
import ru.ixlax.courseservice.repository.LessonRepository;
import ru.ixlax.courseservice.service.LessonService;
import ru.ixlax.courseservice.web.dto.LessonRequest;
import ru.ixlax.courseservice.web.dto.LessonResponse;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final CourseRepository courses;
    private final LessonRepository lessons;
    private final ObjectMapper mapper;

    @Override
    @Transactional
    public LessonResponse create(UUID courseId, UUID authorId, boolean isAdmin, LessonRequest request) {
        Course course = findCourse(courseId);
        ensureOwnerOrAdmin(course, authorId, isAdmin);

        Lesson lesson = Lesson.builder()
                .course(course)
                .title(request.title())
                .content(request.content().toString())
                .orderIndex(resolveOrderIndex(courseId, request.orderIndex()))
                .build();

        return toResponse(lessons.save(lesson));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonResponse> getByCourse(UUID courseId, UUID requesterId, boolean isAdmin) {
        Course course = findCourse(courseId);

        if (!course.isPublished()) {
            ensureOwnerOrAdmin(course, requesterId, isAdmin);
        }

        return lessons.findAllByCourseIdOrderByOrderIndexAscCreatedAtAsc(courseId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public LessonResponse update(UUID courseId, UUID lessonId, UUID authorId, boolean isAdmin, LessonRequest request) {
        Course course = findCourse(courseId);
        ensureOwnerOrAdmin(course, authorId, isAdmin);

        Lesson lesson = lessons.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new LessonNotFoundException(lessonId.toString()));

        lesson.setTitle(request.title());
        lesson.setContent(request.content().toString());
        if (request.orderIndex() != null) {
            lesson.setOrderIndex(request.orderIndex());
        }

        return toResponse(lessons.save(lesson));
    }

    @Override
    @Transactional
    public void delete(UUID courseId, UUID lessonId, UUID authorId, boolean isAdmin) {
        Course course = findCourse(courseId);
        ensureOwnerOrAdmin(course, authorId, isAdmin);

        Lesson lesson = lessons.findByIdAndCourseId(lessonId, courseId)
                .orElseThrow(() -> new LessonNotFoundException(lessonId.toString()));
        lessons.delete(lesson);
    }

    private Course findCourse(UUID id) {
        return courses.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }

    private void ensureOwnerOrAdmin(Course course, UUID authorId, boolean isAdmin) {
        if (isAdmin) return;
        if (authorId == null || !course.getAuthorId().equals(authorId)) {
            throw new CourseAccessDeniedException(course.getId().toString());
        }
    }

    private Integer resolveOrderIndex(UUID courseId, Integer provided) {
        if (provided != null) {
            return provided;
        }
        return Math.toIntExact(lessons.countByCourseId(courseId));
    }

    private LessonResponse toResponse(Lesson lesson) {
        return new LessonResponse(
                lesson.getId(),
                lesson.getCourse().getId(),
                lesson.getTitle(),
                readContent(lesson.getContent()),
                lesson.getOrderIndex()
        );
    }

    private JsonNode readContent(String content) {
        try {
            return mapper.readTree(content);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Не удалось прочитать содержимое урока", e);
        }
    }
}
