package com.games.backend.feature;

import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
public class FeaturesController {

  private final Environment env;

  public FeaturesController(Environment env) {
    this.env = env;
  }

  @GetMapping
  public ResponseEntity<Map<String, Object>> list() {
    Map<String, Object> res = new HashMap<>();

    // Top‑level boolean flags
    res.put("realtime_enabled", getBool("features.realtime_enabled", true));
    res.put("chess_enabled", getBool("features.chess_enabled", true));
    res.put("checkers_enabled", getBool("features.checkers_enabled", true));

    // Grouped flags
    res.put("payments.stripe_enabled", getBool("features.payments.stripe_enabled", false));
    res.put("cache.redis_enabled", getBool("features.cache.redis_enabled", false));
    res.put("kv.redis_enabled", getBool("features.kv.redis_enabled", false));
    res.put("db.external_enabled", getBool("features.db.external_enabled", true));
    res.put("mail.provider", env.getProperty("features.mail.provider", "smtp"));

    return ResponseEntity.ok(res);
  }

  private boolean getBool(String key, boolean def) {
    return env.getProperty(key, Boolean.class, def);
  }
}
