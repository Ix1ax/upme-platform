package ru.ixlax.profileservice.web.dto;

import ru.ixlax.profileservice.domain.Profile;

import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String displayName,
        String bio,
        String avatarUrl,
        String city,
        String phone,
        String role
) {
    public static ProfileResponse from(Profile profile, String role) {
        return new ProfileResponse(
                profile.getId(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getCity(),
                profile.getPhone(),
                role
        );
    }

}
