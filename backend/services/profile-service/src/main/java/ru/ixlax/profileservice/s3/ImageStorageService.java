package ru.ixlax.profileservice.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.profileservice.web.dto.ProfileResponse;
import ru.ixlax.profileservice.web.dto.ProfileUpdateAvatarRequest;
import ru.ixlax.profileservice.web.dto.ProfileUpdateWithoutAvatarRequest;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.net.URI;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageStorageService {

    private final S3Client s3;

    @Value("${app.s3.bucket}")
    private String bucket;

    @Value("${app.s3.endpoint}")
    private String endpoint; // например http://minio:9000 или http://IP:9000

    @Value("${app.s3.publicBaseUrl}")
    private String publicBaseUrl;

    @Value("${app.s3.pathStyle:true}")
    private boolean pathStyle;

    @Value("${app.s3.publicBucket:true}")
    private boolean publicBucket;

    private static final Set<String> ALLOWED = Set.of(
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            "image/webp"
    );

    public String upload(MultipartFile avatar) {
        if (avatar.isEmpty()) {
            throw new IllegalArgumentException("Файл пустой");
        }
        if (!ALLOWED.contains(avatar.getContentType())) {
            throw new IllegalArgumentException("Недопустимый тип: " + avatar.getContentType());
        }
        if (avatar.getSize() > 10 * 1024 * 1024) { // 10MB
            throw new IllegalArgumentException("Слишком большой файл (>10MB)");
        }

        String ext = guessExtension(avatar.getOriginalFilename(), avatar.getContentType());
        String objectKey = "uploads/%s.%s".formatted(UUID.randomUUID(), ext);

        ensureBucket();

        PutObjectRequest put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(objectKey)
                .contentType(avatar.getContentType())
                .build();

        try {
            s3.putObject(put, RequestBody.fromInputStream(avatar.getInputStream(), avatar.getSize()));
        } catch (Exception e) {
            throw new RuntimeException("Ошибка загрузки в S3/MinIO", e);
        }

        String url = buildPublicUrl(objectKey);

        return url;

    }

    private void ensureBucket() {
        try {
            s3.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404) {
                s3.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            } else {
                throw e;
            }
        }
    }

    private String buildPublicUrl(String key) {
        String base = publicBaseUrl.endsWith("/") ? publicBaseUrl.substring(0, publicBaseUrl.length() - 1) : publicBaseUrl;
        return base + "/" + bucket + "/" + key; // при pathStyle=true
    }

    private String guessExtension(String originalName, String contentType) {
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.isBlank()) {
            if (MediaType.IMAGE_PNG_VALUE.equals(contentType)) return "png";
            if (MediaType.IMAGE_JPEG_VALUE.equals(contentType)) return "jpg";
            if ("image/webp".equals(contentType)) return "webp";
            return "bin";
        }
        return ext;
    }
}
