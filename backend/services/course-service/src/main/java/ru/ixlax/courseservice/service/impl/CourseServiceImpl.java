package ru.ixlax.courseservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.domain.Course;
import ru.ixlax.courseservice.exception.custom.CourseAccessDeniedException;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.repository.CourseRepository;
import ru.ixlax.courseservice.s3.CourseStorageService;
import ru.ixlax.courseservice.service.CourseService;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseStorageService storageService;

    @Override
    @Transactional
    public CourseResponse create(Jwt jwt, CourseRequest request, MultipartFile preview) {
        UUID authorId = UUID.fromString(jwt.getSubject());

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .authorId(authorId)
                .previewUrl(null)
                .structureUrl(null)
                .published(false)
                .rating(0.0)
                .build();

        courseRepository.save(course);

        String previewUrl = (preview != null && !preview.isEmpty())
                ? storageService.uploadPreview(course.getId(), preview)
                : null;

        String structureUrl = (request.structureJson() != null && !request.structureJson().isBlank())
                ? storageService.uploadStructure(course.getId(), request.structureJson())
                : null;

        course.setPreviewUrl(previewUrl);
        course.setStructureUrl(structureUrl);

        return CourseResponse.from(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> getAll() {
        return courseRepository.getAllByPublishedTrue().stream().map(CourseResponse::from).toList();
    }

    @Override
    public CourseResponse getById(UUID id) {
        return courseRepository.findById(id).map(CourseResponse::from)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }


    @Override
    @Transactional
    public CourseResponse update(UUID id, CourseRequest request, MultipartFile preview) {
//        Course course = courseRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Курс не найден"));
//
//        if (preview != null && !preview.isEmpty())
//            course.setPreviewUrl(storageService.uploadPreview(preview));
//
//        if (request.structureJson() != null && !request.structureJson().isBlank())
//            course.setStructureUrl(storageService.uploadStructure(request.structureJson()));
//
//        course.setTitle(request.title());
//        course.setDescription(request.description());
//        return CourseResponse.from(courseRepository.save(course));
        return null;
    }

    @Override
    public CourseResponse publish(UUID id, boolean published) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
        course.setPublished(published);
        return CourseResponse.from(courseRepository.save(course));
    }

    @Override
    public Void deleteById(UUID courseID, Jwt jwt) {
        Course course = courseRepository.findById(courseID)
                .orElseThrow(() -> new CourseNotFoundException(courseID.toString()));

        UUID authorId = UUID.fromString(jwt.getSubject());
        String role = jwt.getClaim("role");

        if (role.equals("TEACHER")) {
            if (!courseRepository.existsByIdAndAuthorId(courseID, authorId)) {
                throw new CourseAccessDeniedException(courseID.toString());
            }
        }

        courseRepository.delete(course);
        return null;
    }

    @Override
    public List<CourseResponse> getMy(Jwt jwt) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        return courseRepository.getAllByAuthorId(authorId).stream().map(CourseResponse::from).toList();
    }
}