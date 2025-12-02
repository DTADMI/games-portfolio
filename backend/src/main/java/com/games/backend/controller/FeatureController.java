package com.games.backend.controller;

import com.games.backend.features.FeatureFlagsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class FeatureController {

    private final FeatureFlagsService flags;

    public FeatureController(FeatureFlagsService flags) {
        this.flags = flags;
    }

    @GetMapping("/features")
    public ResponseEntity<Map<String, Boolean>> all() {
        return ResponseEntity.ok(flags.evaluateAll());
    }

    @PostMapping("/admin/features/{flag}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggle(@PathVariable String flag, @RequestParam(defaultValue = "true") boolean enable) {
        if (!flags.knownFlags().contains(flag)) {
            return ResponseEntity.badRequest().body(Map.of("error", "unknown flag: "+flag));
        }
        flags.toggle(flag, enable);
        return ResponseEntity.ok(Map.of("flag", flag, "enabled", flags.isEnabled(flag)));
    }
}
