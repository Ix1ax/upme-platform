package ru.ixlax.courseservice.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.service.CourseService;
import ru.ixlax.courseservice.web.dto.CatalogFilter;
import ru.ixlax.courseservice.web.dto.CourseAuthorResponse;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static ru.ixlax.courseservice.web.SwaggerRoleTags.PUBLIC;
import static ru.ixlax.courseservice.web.SwaggerRoleTags.TEACHER_ADMIN;


@Tag(name = "Courses", description = "Каталог курсов и операции для авторов/админов")
@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courses;
    private final ObjectMapper mapper;

    @Operation(
            summary = "Список опубликованных курсов",
            description = """
                    Возвращает карточки всех опубликованных курсов для каталога. \
                    Поддерживает фильтры по названию/описанию, автору, минимальному рейтингу \
                    и сортировку (rating_desc | rating_asc | newest | oldest)."""
    )
    @Tag(name = PUBLIC)
    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll(
            @ParameterObject CatalogFilter filter
    ) {
        return ResponseEntity.ok(courses.getAll(filter));
    }

    @Operation(
            summary = "Авторы опубликованных курсов",
            description = "Возвращает авторов, у которых есть опубликованные курсы (для фильтров каталога)."
    )
    @Tag(name = PUBLIC)
    @GetMapping("/authors")
    public ResponseEntity<List<CourseAuthorResponse>> getAuthors() {
        return ResponseEntity.ok(courses.getAuthors());
    }

    @Operation(summary = "Получить курс по ID", description = "Доступно всем. Возвращает описание и ссылки на структуру/уроки.")
    @Tag(name = PUBLIC)
    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(courses.getById(id));
    }

    @Operation(
            summary = "Мои курсы",
            description = "Возвращает все курсы, созданные автором.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<List<CourseResponse>> getMy(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(courses.getMy(UUID.fromString(jwt.getSubject())));
    }

    @Operation(
            summary = "Создать курс",
            description = "Multipart запрос: JSON с метаданными + structure/lessons/preview/assets. Возвращает созданный курс.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> create(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "structure", required = false) String structureJson,
            @RequestPart(value = "lessons", required = false) String lessonsJson,
            @RequestPart(value = "preview", required = false) MultipartFile preview,
            @RequestPart(value = "assets", required = false) List<MultipartFile> assets
    ) throws Exception {

        CourseRequest req = mapper.readValue(dataJson, CourseRequest.class);
        UUID authorId = UUID.fromString(jwt.getSubject());

        return ResponseEntity.ok(
                courses.create(authorId, req, structureJson, lessonsJson, preview, assets)
        );
    }

    @Operation(
            summary = "Обновить курс (JSON)",
            description = "Принимает только JSON тело CourseRequest без загрузки файлов.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> updateJson(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CourseRequest req
    ) throws Exception {

        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));

        return ResponseEntity.ok(
                courses.update(
                        id,
                        authorId,
                        isAdmin,
                        req,
                        null,
                        null,
                        null,
                        null
                )
        );
    }

    @Operation(
            summary = "Обновить курс (multipart)",
            description = "Позволяет заменить JSON + превью + ассеты в одном multipart запросе.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> updateMultipart(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestPart("data") String dataJson,
            @RequestPart(value = "structure", required = false) String structureJson,
            @RequestPart(value = "lessons", required = false) String lessonsJson,
            @RequestPart(value = "preview", required = false) MultipartFile preview,
            @RequestPart(value = "assets", required = false) List<MultipartFile> assets
    ) throws Exception {

        CourseRequest req = mapper.readValue(dataJson, CourseRequest.class);
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));

        return ResponseEntity.ok(
                courses.update(id, authorId, isAdmin, req, structureJson, lessonsJson, preview, assets)
        );
    }

    @Operation(
        summary = "Загрузить structure.json",
        description = "Полностью заменяет JSON структуру курса.",
        security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PutMapping(value = "/{id}/structure", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> putStructure(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody String json
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(courses.putStructureJson(id, authorId, isAdmin, json));
    }

    @Operation(
        summary = "Загрузить lessons.json",
        description = "Заменяет JSON с уроками/контентом в хранилище.",
        security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PutMapping(value = "/{id}/lessons", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> putLessons(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody String json
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(courses.putLessonsJson(id, authorId, isAdmin, json));
    }

    @Operation(
            summary = "Загрузить ассет курса",
            description = "Сохраняет файл (PDF, изображение и пр.) в хранилище курса и возвращает публичный URL.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PostMapping(value = "/{id}/assets", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Map<String, String>> uploadAsset(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "path", required = false) String subPath
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));

        String url = courses.uploadAsset(id, authorId, isAdmin, subPath, file);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @Operation(
            summary = "Опубликовать/скрыть курс",
            description = "Меняет флаг published. Недоступно для студентов.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<CourseResponse> publish(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestParam boolean published
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        return ResponseEntity.ok(courses.publish(id, published, authorId, isAdmin));
    }

    @Operation(
            summary = "Удалить курс",
            description = "Удаляет курс вместе с уроками. Доступно автору или админу.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = TEACHER_ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt
    ) {
        UUID authorId = UUID.fromString(jwt.getSubject());
        boolean isAdmin = "ADMIN".equals(jwt.getClaimAsString("role"));
        courses.deleteById(id, authorId, isAdmin);
        return ResponseEntity.noContent().build();
    }
}
