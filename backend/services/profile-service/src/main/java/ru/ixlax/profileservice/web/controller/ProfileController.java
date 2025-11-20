package ru.ixlax.profileservice.web.controller;

import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.ixlax.profileservice.service.ProfileService;
import ru.ixlax.profileservice.web.dto.ProfileResponse;
import ru.ixlax.profileservice.web.dto.ProfileUpdateWithoutAvatarRequest;

import java.util.UUID;

import static ru.ixlax.profileservice.web.SwaggerRoleTags.AUTHENTICATED;

@Tag(name = "Profile", description = "Просмотр и редактирование данных пользователя")
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @Operation(
            summary = "Получить мой профиль",
            description = "Возвращает профиль авторизованного пользователя. Создаёт запись, если она ещё не была сохранена.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = AUTHENTICATED)
    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = requireUser(jwt);
        return ResponseEntity.ok(profileService.getProfile(userId, jwt.getClaim("role")));
    }

    @Operation(
            summary = "Обновить профиль (JSON)",
            description = "Принимает JSON с полями profile. Отсутствующие поля не затираются.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = {
                    @Content(mediaType = MediaType.APPLICATION_JSON_VALUE),
                    @Content(mediaType = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
            }
    )
    @Tag(name = AUTHENTICATED)
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ProfileResponse> updateProfileJson(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfileUpdateWithoutAvatarRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(requireUser(jwt), jwt.getClaim("role"), request));
    }

    @Hidden
    @PostMapping(consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<ProfileResponse> updateProfileForm(
            @AuthenticationPrincipal Jwt jwt,
            ProfileUpdateWithoutAvatarRequest request
    ) {
        return ResponseEntity.ok(profileService.updateProfile(requireUser(jwt), jwt.getClaim("role"), request));
    }

    @Operation(
            summary = "Обновить аватар",
            description = "Принимает multipart/form-data с файлом avatar. Возвращает обновлённый профиль.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = AUTHENTICATED)
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProfileResponse> updateAvatar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("avatar") MultipartFile avatar
    ) {
        return ResponseEntity.ok(profileService.updateProfileAvatar(requireUser(jwt), jwt.getClaim("role"), avatar));
    }

    private UUID requireUser(Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            throw new IllegalArgumentException("Требуется авторизация");
        }
        return UUID.fromString(jwt.getSubject());
    }
}
