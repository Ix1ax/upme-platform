package ru.ixlax.courseservice.service.impl;

import lombok.RequiredArgsConstructor;
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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository repo;
    private final CourseStorageService storage;

    /* ---------------- CREATE ---------------- */

    @Override
    @Transactional
    public CourseResponse create(
            UUID authorId,
            CourseRequest req,
            String structureJson,
            String lessonsJson,
            MultipartFile preview,
            List<MultipartFile> assets
    ) throws Exception {

        Course c = Course.builder()
                .title(req.title())
                .description(req.description())
                .authorId(authorId)
                .rating(0.0)
                .published(false)
                .build();

        repo.save(c);

        if (structureJson != null)
            c.setStructureUrl(storage.uploadString(c.getId(), "structure.json", structureJson));

        if (lessonsJson != null)
            c.setLessonsUrl(storage.uploadString(c.getId(), "lessons.json", lessonsJson));

        if (preview != null)
            c.setPreviewUrl(storage.uploadPreview(c.getId(), preview));

        if (assets != null)
            storage.uploadAssets(c.getId(), assets);

        return CourseResponse.from(repo.save(c));
    }

    /* ---------------- READ ---------------- */

    @Override
    public List<CourseResponse> getAll() {
        return repo.getAllByPublishedTrue().stream().map(CourseResponse::from).toList();
    }

    @Override
    public List<CourseResponse> getMy(UUID authorId) {
        return repo.getAllByAuthorId(authorId).stream().map(CourseResponse::from).toList();
    }

    @Override
    public CourseResponse getById(UUID id) {
        return repo.findById(id)
                .map(CourseResponse::from)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
    }

    /* ---------------- UPDATE ---------------- */

    @Override
    @Transactional
    public CourseResponse update(
            UUID id,
            UUID authorId,
            boolean isAdmin,
            CourseRequest req,
            String structureJson,
            String lessonsJson,
            MultipartFile preview,
            List<MultipartFile> assets
    ) throws Exception {

        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));

        ensureOwnerOrAdmin(c, authorId, isAdmin);

        if (req.title() != null)
            c.setTitle(req.title());

        if (req.description() != null)
            c.setDescription(req.description());

        if (structureJson != null)
            c.setStructureUrl(storage.uploadString(c.getId(), "structure.json", structureJson));

        if (lessonsJson != null)
            c.setLessonsUrl(storage.uploadString(c.getId(), "lessons.json", lessonsJson));

        if (preview != null)
            c.setPreviewUrl(storage.uploadPreview(c.getId(), preview));

        if (assets != null)
            storage.uploadAssets(c.getId(), assets);

        return CourseResponse.from(repo.save(c));
    }

    /* ---------------- PUT JSON FILES ---------------- */

    @Override
    @Transactional
    public CourseResponse putStructureJson(UUID id, UUID authorId, boolean isAdmin, String json) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
        ensureOwnerOrAdmin(c, authorId, isAdmin);

        c.setStructureUrl(storage.uploadString(id, "structure.json", json));
        return CourseResponse.from(repo.save(c));
    }

    @Override
    @Transactional
    public CourseResponse putLessonsJson(UUID id, UUID authorId, boolean isAdmin, String json) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));
        ensureOwnerOrAdmin(c, authorId, isAdmin);

        c.setLessonsUrl(storage.uploadString(id, "lessons.json", json));
        return CourseResponse.from(repo.save(c));
    }

    /* ---------------- ASSETS ---------------- */

    @Override
    public String uploadAsset(UUID id, UUID authorId, boolean isAdmin, String subPath, MultipartFile file) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));

        ensureOwnerOrAdmin(c, authorId, isAdmin);

        return storage.putAsset(c.getId(), subPath, file);
    }

    /* ---------------- PUBLISH / DELETE ---------------- */

    @Override
    @Transactional
    public CourseResponse publish(UUID id, boolean published, UUID authorId, boolean isAdmin) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));

        ensureOwnerOrAdmin(c, authorId, isAdmin);
        c.setPublished(published);

        return CourseResponse.from(repo.save(c));
    }

    @Override
    @Transactional
    public Void deleteById(UUID id, UUID authorId, boolean isAdmin) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new CourseNotFoundException(id.toString()));

        ensureOwnerOrAdmin(c, authorId, isAdmin);
        repo.delete(c);
        return null;
    }

    /* ---------------- HELPERS ---------------- */

    private void ensureOwnerOrAdmin(Course c, UUID authorId, boolean isAdmin) {
        if (isAdmin) return;
        if (!c.getAuthorId().equals(authorId)) {
            throw new CourseAccessDeniedException(c.getId().toString());
        }
    }
}