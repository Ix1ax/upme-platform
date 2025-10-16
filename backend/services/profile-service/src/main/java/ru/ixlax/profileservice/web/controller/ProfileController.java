package ru.ixlax.profileservice.web.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.profileservice.service.ProfileService;
import ru.ixlax.profileservice.web.dto.ProfileResponse;
import ru.ixlax.profileservice.web.dto.ProfileUpdateAvatarRequest;
import ru.ixlax.profileservice.web.dto.ProfileUpdateWithoutAvatarRequest;

import java.util.UUID;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String role = jwt.getClaim("role");
        return ResponseEntity.ok(profileService.getProfile(userId,role));
    }

    @PostMapping
    public ResponseEntity<ProfileResponse> updateProfile(@AuthenticationPrincipal Jwt jwt, ProfileUpdateWithoutAvatarRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String role = jwt.getClaim("role");
        return ResponseEntity.ok(profileService.updateProfile(userId,role,request));
    }

    @PostMapping("/avatar")
    public ResponseEntity<ProfileResponse> updateAvatar(@AuthenticationPrincipal Jwt jwt, @RequestPart("avatar") MultipartFile avatar) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String role = jwt.getClaim("role");

        return ResponseEntity.ok(profileService.updateProfileAvatar(userId,role, avatar));
    }

}
