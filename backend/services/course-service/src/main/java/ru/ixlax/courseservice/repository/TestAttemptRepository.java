package ru.ixlax.courseservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.ixlax.courseservice.domain.TestAttempt;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TestAttemptRepository extends JpaRepository<TestAttempt, UUID> {
    List<TestAttempt> findAllByTestIdAndUserIdOrderByCreatedAtDesc(UUID testId, UUID userId);
    Optional<TestAttempt> findTopByTestIdAndUserIdOrderByCreatedAtDesc(UUID testId, UUID userId);
}
