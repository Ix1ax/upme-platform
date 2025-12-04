package ru.ixlax.courseservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.domain.Course;
import ru.ixlax.courseservice.exception.custom.CourseAccessDeniedException;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.repository.CourseRepository;
import ru.ixlax.courseservice.repository.projection.AuthorAggregation;
import ru.ixlax.courseservice.repository.specification.CourseSpecifications;
import ru.ixlax.courseservice.s3.CourseStorageService;
import ru.ixlax.courseservice.service.AuthorDirectoryClient;
import ru.ixlax.courseservice.service.CourseService;
import ru.ixlax.courseservice.web.dto.CourseAuthorResponse;
import ru.ixlax.courseservice.web.dto.CatalogFilter;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.springframework.util.StringUtils.hasText;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository repo;
    private final CourseStorageService storage;
    private final AuthorDirectoryClient authorDirectory;

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
    public List<CourseResponse> getAll(CatalogFilter filter) {
        CatalogFilter normalized = filter == null
                ? new CatalogFilter(null, null, null, null)
                : filter;

        Specification<Course> spec = Specification.where(CourseSpecifications.published());

        if (hasText(normalized.query())) {
            spec = spec.and(CourseSpecifications.titleOrDescriptionContains(normalized.query()));
        }
        if (normalized.authorId() != null) {
            spec = spec.and(CourseSpecifications.authorEquals(normalized.authorId()));
        }
        if (normalized.minRating() != null) {
            spec = spec.and(CourseSpecifications.ratingGte(normalized.minRating()));
        }

        Sort sort = resolveSort(normalized.sort());

        return repo.findAll(spec, sort).stream().map(CourseResponse::from).toList();
    }

    @Override
    public List<CourseAuthorResponse> getAuthors() {
        List<AuthorAggregation> authors = repo.findPublishedAuthors();
        Map<UUID, String> names = authorDirectory.fetchAuthorNames(
                authors.stream().map(AuthorAggregation::getAuthorId).toList()
        );

        return authors.stream()
                .map(author -> new CourseAuthorResponse(
                        author.getAuthorId(),
                        names.get(author.getAuthorId()),
                        author.getCoursesCount()
                ))
                .toList();
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

    private Sort resolveSort(String sortKey) {
        String key = sortKey == null ? "rating_desc" : sortKey.toLowerCase();
        return switch (key) {
            case "rating_asc" -> Sort.by(Sort.Direction.ASC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            default -> Sort.by(Sort.Direction.DESC, "rating");
        };
    }

    private void ensureOwnerOrAdmin(Course c, UUID authorId, boolean isAdmin) {
        if (isAdmin) return;
        if (!c.getAuthorId().equals(authorId)) {
            throw new CourseAccessDeniedException(c.getId().toString());
        }
    }
}
