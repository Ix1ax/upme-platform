package ru.ixlax.profileservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.profileservice.domain.Profile;

import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
}
