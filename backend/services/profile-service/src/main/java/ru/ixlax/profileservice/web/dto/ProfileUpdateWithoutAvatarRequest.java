package ru.ixlax.profileservice.web.dto;

public record ProfileUpdateWithoutAvatarRequest(
        String displayName,
        String bio,
        String city,
        String phone
) {

}
