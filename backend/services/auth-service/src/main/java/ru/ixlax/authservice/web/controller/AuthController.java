package ru.ixlax.authservice.web.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ru.ixlax.authservice.security.JwtAuthFilter;
import ru.ixlax.authservice.service.AuthService;
import ru.ixlax.authservice.web.SwaggerRoleTags;
import ru.ixlax.authservice.web.dto.*;

import java.util.List;
import java.util.UUID;

import static ru.ixlax.authservice.web.SwaggerRoleTags.AUTHENTICATED;
import static ru.ixlax.authservice.web.SwaggerRoleTags.PUBLIC;

@Tag(name = "Auth", description = "Регистрация, вход и управление JWT")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "Регистрация пользователя",
            description = "Создаёт аккаунт и сразу возвращает пару access/refresh токенов."
    )
    @Tag(name = PUBLIC)
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @Operation(
            summary = "Логин",
            description = "Проверяет email и пароль, выдаёт новую пару токенов."
    )
    @Tag(name = PUBLIC)
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @Operation(
            summary = "Обновление access токена",
            description = "Принимает действительный refresh токен, возвращает новую пару."
    )
    @Tag(name = PUBLIC)
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(authService.refresh(req));
    }

    @Operation(
            summary = "Выход из системы",
            description = "Инвалидирует refresh токен пользователя.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = AUTHENTICATED)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest req) {
        authService.logout(req.refreshToken());
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Получить данные авторизованного пользователя",
            description = "Удобная ручка для фронта, чтобы показать имя/роль в UI.",
            security = @SecurityRequirement(name = "BearerAuth")
    )
    @Tag(name = AUTHENTICATED)
    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> me(
            @AuthenticationPrincipal JwtAuthFilter.AuthenticatedUserPrincipal principal
    ) {
        if (principal == null) return ResponseEntity.status(401).build();
        var u = principal.getUser();
        return ResponseEntity.ok(new UserMeResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name()));
    }

    @Operation(
            summary = "Список авторов (TEACHER/ADMIN)",
            description = "Возвращает краткие данные об авторах. Можно передать ids=... для выборки конкретных авторов."
    )
    @Tag(name = PUBLIC)
    @GetMapping("/authors")
    public ResponseEntity<List<UserShortResponse>> authors(
            @RequestParam(name = "ids", required = false) List<UUID> ids
    ) {
        return ResponseEntity.ok(authService.getAuthors(ids));
    }
}
