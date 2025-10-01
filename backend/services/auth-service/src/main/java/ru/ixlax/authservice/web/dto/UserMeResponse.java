package ru.ixlax.authservice.web.dto;

import java.util.UUID;

public record UserMeResponse(
        UUID id,
        String name,
        String email,
        String role
) {}