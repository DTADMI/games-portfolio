// src/main/java/com/games/backend/controller/ScoreController.java
package com.games.backend.controller;

import com.games.backend.model.GameScore;
import com.games.backend.model.User;
import com.games.backend.service.GameService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private final GameService gameService;

    public ScoreController(GameService gameService) {
        this.gameService = gameService;
    }

    @PostMapping
    public ResponseEntity<GameScore> saveScore(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, Object> payload
    ) {
        String gameType = (String) payload.get("gameType");
        int score = (int) payload.get("score");

        GameScore savedScore = gameService.saveScore(user, gameType, score);
        return ResponseEntity.ok(savedScore);
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<Map<String, List<GameScore>>> getLeaderboard() {
        Map<String, List<GameScore>> leaderboard = gameService.getLeaderboard();
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, List<GameScore>>> getUserScores(@AuthenticationPrincipal User user) {
        Map<String, List<GameScore>> userScores = gameService.getUserScores(user.getId());
        return ResponseEntity.ok(userScores);
    }
}