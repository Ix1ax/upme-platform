package ru.ixlax.profileservice.web.dto;

import org.springframework.web.multipart.MultipartFile;

public record ProfileUpdateAvatarRequest(
        MultipartFile avatar
) {
}
