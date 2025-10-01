package ru.ixlax.authservice.service;

import ru.ixlax.authservice.web.dto.*;

public interface AuthService {
    TokenResponse register(RegisterRequest req);
    TokenResponse login(LoginRequest req);
    TokenResponse refresh(RefreshRequest req);
    void logout(String refreshToken);
}