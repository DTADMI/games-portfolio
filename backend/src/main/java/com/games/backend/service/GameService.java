// src/main/java/com/games/backend/service/GameService.java
package com.games.backend.service;

import com.games.backend.model.GameScore;
import com.games.backend.model.User;
import com.games.backend.repository.GameScoreRepository;
import org.ff4j.FF4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class GameService {
    private static final int LEADERBOARD_SIZE = 10;
    private static final int USER_SCORES_LIMIT = 5;

    private final GameScoreRepository gameScoreRepository;
    private final FF4j ff4j;

    public GameService(GameScoreRepository gameScoreRepository, FF4j ff4j) {
        this.gameScoreRepository = gameScoreRepository;
        this.ff4j = ff4j;
    }

    @Transactional
    @CacheEvict(value = {"leaderboard", "userScores"}, allEntries = true)
    public GameScore saveScore(User user, String gameType, int score) {
        GameScore gameScore = new GameScore();
        gameScore.setUser(user);
        gameScore.setGameType(gameType);
        gameScore.setScore(score);
        return gameScoreRepository.save(gameScore);
    }

    @Cacheable(value = "leaderboard", key = "#gameType")
    public List<GameScore> getLeaderboard(String gameType) {
        Pageable pageable = PageRequest.of(0, LEADERBOARD_SIZE, Sort.by("score").descending().and(Sort.by("createdAt").ascending()));
        return gameScoreRepository.findTopScoresByGameType(gameType, pageable);
    }

    @Cacheable(value = "userScores", key = "#userId + '_' + #gameType")
    public List<GameScore> getUserScores(Long userId, String gameType) {
        Pageable pageable = PageRequest.of(0, USER_SCORES_LIMIT, Sort.by("score").descending().and(Sort.by("createdAt").ascending()));
        return gameScoreRepository.findUserScores(userId, gameType, pageable);
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @CacheEvict(value = {"leaderboard", "userScores"}, allEntries = true)
    public void clearCache() {
        // Cache cleared by annotation
    }

    public boolean isFeatureEnabled(String featureName) {
        return ff4j.check(featureName);
    }
}