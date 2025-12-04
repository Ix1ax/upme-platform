package ru.ixlax.authservice.service;

import ru.ixlax.authservice.web.dto.*;

import java.util.List;
import java.util.UUID;

public interface AuthService {
    TokenResponse register(RegisterRequest req);
    TokenResponse login(LoginRequest req);
    TokenResponse refresh(RefreshRequest req);
    void logout(String refreshToken);
    List<UserShortResponse> getAuthors(List<UUID> ids);
}
