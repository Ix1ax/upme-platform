package ru.ixlax.profileservice.service;

import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.profileservice.web.dto.ProfileResponse;
import ru.ixlax.profileservice.web.dto.ProfileUpdateWithoutAvatarRequest;

import java.util.UUID;

public interface ProfileService {

    ProfileResponse getProfile(UUID userId, String role);
    ProfileResponse updateProfile(UUID userId, String role, ProfileUpdateWithoutAvatarRequest request);
    ProfileResponse updateProfileAvatar(UUID userId, String role, MultipartFile avatar);

}
