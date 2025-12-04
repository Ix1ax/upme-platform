package ru.ixlax.authservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.ixlax.authservice.domain.User;
import ru.ixlax.authservice.domain.Role;

import java.util.Optional;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
    List<User> findAllByRole(Role role);
    List<User> findAllByIdIn(Collection<UUID> ids);
    List<User> findAllByIdInAndRoleIn(Collection<UUID> ids, Collection<Role> roles);
    List<User> findAllByRoleIn(Collection<Role> roles);
}
