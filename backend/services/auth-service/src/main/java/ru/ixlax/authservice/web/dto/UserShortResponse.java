package ru.ixlax.authservice.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import ru.ixlax.authservice.domain.User;

import java.util.UUID;

@Schema(description = "Краткая информация о пользователе (для справочников/фильтров)")
public record UserShortResponse(
        @Schema(description = "ID пользователя") UUID id,
        @Schema(description = "Имя/отображаемое имя") String name,
        @Schema(description = "Email") String email,
        @Schema(description = "Роль (STUDENT/TEACHER/ADMIN)") String role
) {
    public static UserShortResponse from(User user) {
        return new UserShortResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
