package ru.ixlax.courseservice.web.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.exception.custom.CourseAccessDeniedException;
import ru.ixlax.courseservice.exception.custom.CourseNotFoundException;
import ru.ixlax.courseservice.service.CourseService;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(courseService.getById(id));
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @PostMapping()
    public ResponseEntity<CourseResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody CourseRequest request
        //    @RequestPart(value = "preview", required = false) MultipartFile preview
    ) {
        return ResponseEntity.ok(courseService.create(jwt, request, null));
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<List<CourseResponse>> getMy(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(courseService.getMy(jwt));
    }

    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @DeleteMapping("/{courseID}")
    public ResponseEntity<Void> deleteById(@PathVariable UUID courseID, @AuthenticationPrincipal Jwt jwt) {
        try {
            courseService.deleteById(courseID, jwt);
            return ResponseEntity.noContent().build();
        } catch (CourseNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (CourseAccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

//    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
//    @PatchMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE })
//    public ResponseEntity<CourseResponse> update(
//            @PathVariable UUID id,
//            @RequestPart("data") CourseRequest request,
//            @RequestPart(value = "preview", required = false) MultipartFile preview
//    ) throws IOException {
//        return ResponseEntity.ok(courseService.update(id, request, preview));
//    }

    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @PatchMapping("/{id}/publish")
    public ResponseEntity<CourseResponse> publish(
            @PathVariable UUID id,
            @RequestParam boolean published
    ) {
        return ResponseEntity.ok(courseService.publish(id, published));
    }
}