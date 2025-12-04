package ru.ixlax.courseservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
public class AuthorDirectoryClient {

    private final RestClient restClient;

    public AuthorDirectoryClient(
            RestClient.Builder builder,
            @Value("${app.auth.url:http://auth-service:8081}") String authBaseUrl
    ) {
        this.restClient = builder
                .baseUrl(authBaseUrl)
                .build();
    }

    public Map<UUID, String> fetchAuthorNames(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            List<AuthAuthorResponse> authors = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/auth/authors")
                            .queryParam("ids", ids.stream().map(UUID::toString).toArray())
                            .build())
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (authors == null) {
                return Collections.emptyMap();
            }

            return authors.stream()
                    .collect(Collectors.toMap(AuthAuthorResponse::id, AuthAuthorResponse::name));
        } catch (Exception ex) {
            log.warn("Не удалось получить имена авторов из auth-service: {}", ex.getMessage());
            return Collections.emptyMap();
        }
    }

    private record AuthAuthorResponse(UUID id, String name) {}
}
