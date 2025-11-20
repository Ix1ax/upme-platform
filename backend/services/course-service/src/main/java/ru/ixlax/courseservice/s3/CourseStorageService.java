package ru.ixlax.courseservice.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseStorageService {

    private final S3Client s3;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.publicBaseUrl}")
    private String publicBaseUrl;

    /* ============================================================
       BASIC HELPERS
       ============================================================ */

    private String url(String key) {
        return publicBaseUrl + "/" + bucket + "/" + key;
    }

    private String ext(String filename) {
        int i = filename.lastIndexOf(".");
        return (i < 0) ? "" : filename.substring(i);
    }

    /* ============================================================
       UPLOAD SIMPLE FILES
       ============================================================ */

    public String uploadFile(UUID id, String fileName, MultipartFile mf) {
        String key = id + "/" + fileName;

        try {
            s3.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(mf.getContentType())
                            .build(),
                    RequestBody.fromBytes(mf.getBytes())
            );
        } catch (Exception e) {
            throw new RuntimeException("Ошибка загрузки файла: " + fileName, e);
        }

        return url(key);
    }

    public String uploadString(UUID id, String fileName, String content) {
        String key = id + "/" + fileName;

        s3.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType("application/json")
                        .build(),
                RequestBody.fromString(content)
        );

        return url(key);
    }

    public String uploadPreview(UUID id, MultipartFile preview) {
        String ext = ext(preview.getOriginalFilename());
        return uploadFile(id, "preview" + ext, preview);
    }

    /* ============================================================
       UPLOAD JSON FILES (structure + lessons)
       ============================================================ */

    public String uploadStructure(UUID id, MultipartFile file) {
        return uploadFile(id, "structure.json", file);
    }

    public String uploadLessons(UUID id, MultipartFile file) {
        return uploadFile(id, "lessons.json", file);
    }

    /* ============================================================
       BULK ASSETS
       ============================================================ */

    public void uploadAssets(UUID id, List<MultipartFile> assets) {
        if (assets == null) return;

        for (MultipartFile f : assets) {
            String safe = "assets/" + Objects.requireNonNullElse(f.getOriginalFilename(), UUID.randomUUID() + ".bin");
            uploadFile(id, safe, f);
        }
    }

    public String putAsset(UUID id, String subPath, MultipartFile file) {
        if (subPath == null || subPath.isBlank()) {
            subPath = "assets/" + Objects.requireNonNullElse(file.getOriginalFilename(), UUID.randomUUID() + ".bin");
        }
        return uploadFile(id, subPath, file);
    }
}