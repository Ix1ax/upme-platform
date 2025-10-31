package ru.ixlax.courseservice.service;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.courseservice.web.dto.CourseRequest;
import ru.ixlax.courseservice.web.dto.CourseResponse;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

public interface CourseService {
    CourseResponse create(Jwt jwt, CourseRequest request, MultipartFile preview);
    List<CourseResponse> getAll();
    CourseResponse getById(UUID id);
    CourseResponse update(UUID id, CourseRequest request, MultipartFile preview);
    CourseResponse publish(UUID id, boolean published);
    Void deleteById(UUID courseID, Jwt jwt);
    List<CourseResponse> getMy(Jwt jwt);
}