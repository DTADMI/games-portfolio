package com.games.backend.repository;

import com.games.backend.model.RefreshToken;
import com.games.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    long deleteByUser(User user);
    void deleteByExpiresAtBefore(Instant cutoff);
}