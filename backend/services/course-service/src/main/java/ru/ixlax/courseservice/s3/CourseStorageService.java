package ru.ixlax.courseservice.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URL;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseStorageService {

    private final S3Client s3Client;

    @Value("${app.s3.bucket}")
    private String bucket;

    public String uploadStructure(UUID courseID, String json) {
        String key = courseID + "/structure.json";
        s3Client.putObject(PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType("application/json")
                        .build(),
                RequestBody.fromString(json));
        return getUrl(key, courseID);
    }

    public String uploadPreview(UUID courseID, MultipartFile file) {
        String filename = Objects.requireNonNull(file.getOriginalFilename());
        String extension = getFileExtension(filename);
        String key = courseID + "/" + "avatar" + extension;
        try {
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return getUrl(key, courseID);
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex != -1 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex);
        }
        return "";
    }

    private String getUrl(String key, UUID courseID) {
        return String.format("http://localhost:9000/%s/%s", bucket, key);
    }
}