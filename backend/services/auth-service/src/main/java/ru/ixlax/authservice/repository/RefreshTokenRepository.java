package ru.ixlax.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.authservice.domain.RefreshToken;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByToken(String token);

    void deleteByUser_Id(UUID userId);

    Optional<RefreshToken> findByUser_Id(UUID id);
}
