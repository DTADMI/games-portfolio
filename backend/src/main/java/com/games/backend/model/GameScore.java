// src/main/java/com/games/backend/model/GameScore.java
package com.games.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_scores")
@Data
public class GameScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String gameType; // "snake" or "tetris"

    @Column(nullable = false)
    private int score;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

// src/main/java/com/games/backend/repository/GameScoreRepository.java
package com.games.backend.repository;

import com.games.backend.model.GameScore;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface GameScoreRepository extends JpaRepository<GameScore, Long> {
    @Query("SELECT gs FROM GameScore gs WHERE gs.gameType = :gameType ORDER BY gs.score DESC, gs.createdAt ASC")
    List<GameScore> findTopScoresByGameType(@Param("gameType") String gameType, Pageable pageable);

    @Query("SELECT gs FROM GameScore gs WHERE gs.user.id = :userId AND gs.gameType = :gameType ORDER BY gs.score DESC, gs.createdAt ASC")
    List<GameScore> findUserScores(@Param("userId") Long userId, @Param("gameType") String gameType, Pageable pageable);
}