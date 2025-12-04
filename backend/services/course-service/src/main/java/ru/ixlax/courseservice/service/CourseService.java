package ru.ixlax.courseservice.service;

import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;
import ru.ixlax.courseservice.web.dto.CatalogFilter;
import ru.ixlax.courseservice.web.dto.CourseAuthorResponse;

import java.util.List;
import java.util.UUID;

public interface CourseService {

    CourseResponse create(
            UUID authorId,
            CourseRequest req,
            String structureJson,
            String lessonsJson,
            MultipartFile preview,
            List<MultipartFile> assets
    ) throws Exception;

    List<CourseResponse> getAll(CatalogFilter filter);
    List<CourseAuthorResponse> getAuthors();
    List<CourseResponse> getMy(UUID authorId);
    CourseResponse getById(UUID id);

    CourseResponse update(
            UUID id,
            UUID authorId,
            boolean isAdmin,
            CourseRequest req,
            String structureJson,
            String lessonsJson,
            MultipartFile preview,
            List<MultipartFile> assets
    ) throws Exception;

    CourseResponse publish(UUID id, boolean published, UUID authorId, boolean isAdmin);

    Void deleteById(UUID id, UUID authorId, boolean isAdmin);

    CourseResponse putStructureJson(UUID id, UUID authorId, boolean isAdmin, String json);
    CourseResponse putLessonsJson(UUID id, UUID authorId, boolean isAdmin, String json);

    String uploadAsset(UUID id, UUID authorId, boolean isAdmin, String subPath, MultipartFile file);
}
