package ru.ixlax.authservice.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.ixlax.authservice.domain.RefreshToken;
import ru.ixlax.authservice.domain.Role;
import ru.ixlax.authservice.domain.User;
import ru.ixlax.authservice.exception.custom.RefreshTokenBadRequest;
import ru.ixlax.authservice.exception.custom.RefreshTokenExpiredException;
import ru.ixlax.authservice.exception.custom.UserAlreadyExistsException;
import ru.ixlax.authservice.exception.custom.UserBadRequestException;
import ru.ixlax.authservice.repository.RefreshTokenRepository;
import ru.ixlax.authservice.repository.UserRepository;
import ru.ixlax.authservice.security.JwtService;
import ru.ixlax.authservice.service.AuthService;
import ru.ixlax.authservice.web.dto.LoginRequest;
import ru.ixlax.authservice.web.dto.RefreshRequest;
import ru.ixlax.authservice.web.dto.RegisterRequest;
import ru.ixlax.authservice.web.dto.TokenResponse;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwt;

    @Override
    public TokenResponse register(RegisterRequest req) {
        if (Boolean.FALSE.equals(req.getIsAcceptPolicy())) {
            throw new UserBadRequestException("Не принята политика обработки данных");
        }
        if (users.existsByEmail(req.getEmail())) {
            throw new UserAlreadyExistsException(req.getEmail());
        }
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new UserBadRequestException("Пароли не совпадают");
        }

        Role role = Role.valueOf(req.getRole().toUpperCase());

        var user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole(role);
        users.save(user);

        refreshTokens.findByUser_Id(user.getId()).ifPresent(refreshTokens::delete);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiresAt(OffsetDateTime.now().plusDays(30));
        refreshTokens.save(rt);

        String access = jwt.generateAccessToken(user);
        return TokenResponse.bearer(access, rt.getToken());
    }

    @Override
    public TokenResponse login(LoginRequest req) {
        var user = users.findByEmail(req.getEmail())
                .orElseThrow(() -> new UserBadRequestException("Неверный email или пароль"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new UserBadRequestException("Неверный email или пароль");
        }

        refreshTokens.findByUser_Id(user.getId()).ifPresent(refreshTokens::delete);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiresAt(OffsetDateTime.now().plusDays(30));
        refreshTokens.save(rt);

        String access = jwt.generateAccessToken(user);
        return TokenResponse.bearer(access, rt.getToken());
    }

    @Override
    public TokenResponse refresh(RefreshRequest req) {
        var old = refreshTokens.findByToken(req.refreshToken())
                .orElseThrow(() -> new RefreshTokenBadRequest("Неверный refresh токен"));

        if (old.isExpired()) {
            refreshTokens.delete(old);
            throw new RefreshTokenExpiredException("Refresh токен истёк");
        }

        var user = old.getUser();
        refreshTokens.delete(old);
        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiresAt(OffsetDateTime.now().plusDays(30));
        refreshTokens.save(rt);

        String access = jwt.generateAccessToken(user);
        return TokenResponse.bearer(access, rt.getToken());
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokens.findByToken(refreshToken).ifPresent(refreshTokens::delete);
    }

}
