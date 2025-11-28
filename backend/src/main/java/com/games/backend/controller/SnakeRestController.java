package com.games.backend.controller;

import com.games.backend.realtime.dto.RealtimeDtos.Entry;
import com.games.backend.service.LeaderboardService;
import com.games.backend.service.RunIdService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/games/snake")
public class SnakeRestController {

    private static final String SCOPE = "snake:global";

    private final RunIdService runIdService;
    private final LeaderboardService leaderboardService;

    public SnakeRestController(RunIdService runIdService, LeaderboardService leaderboardService) {
        this.runIdService = runIdService;
        this.leaderboardService = leaderboardService;
    }

    /**
     * Start an anti-cheat run by issuing a short-lived runId.
     */
    @PostMapping("/run/start")
    public ResponseEntity<Map<String, Object>> startRun(@AuthenticationPrincipal UserDetails principal) {
        String userOrGuest = principal != null ? principal.getUsername() : "guest";
        String runId = runIdService.start(userOrGuest);
        Map<String, Object> body = new HashMap<>();
        body.put("runId", runId);
        return ResponseEntity.ok(body);
    }

    /**
     * Get a snapshot of the leaderboard. Cached for a few seconds via Caffeine.
     */
    @GetMapping("/leaderboard")
    @Cacheable(value = "lb_snake_global", key = "#limit")
    public ResponseEntity<Map<String, Object>> leaderboard(@RequestParam(defaultValue = "10") int limit) {
        int safeLimit = Math.max(1, Math.min(50, limit));
        List<Entry> top = leaderboardService.topN(SCOPE, safeLimit);
        Map<String, Object> body = new HashMap<>();
        body.put("scope", SCOPE);
        body.put("top", top);
        return ResponseEntity.ok(body);
    }
}
