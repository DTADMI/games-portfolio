package com.games.backend.controller;

import org.ff4j.FF4j;
import org.ff4j.core.Feature;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class FeaturesController {

    private final FF4j ff4j;

    public FeaturesController(FF4j ff4j) {
        this.ff4j = ff4j;
    }

    @GetMapping("/features")
    public Map<String, Boolean> listFeatures() {
        return ff4j.getFeatures().values().stream()
                .collect(Collectors.toMap(Feature::getUid, Feature::isEnable));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/features/{uid}/toggle")
    public ResponseEntity<?> toggleFeature(@PathVariable String uid, @RequestParam(defaultValue = "true") boolean enable) {
        if (!ff4j.exist(uid)) {
            ff4j.createFeature(uid, enable);
        } else if (enable) {
            ff4j.enable(uid);
        } else {
            ff4j.disable(uid);
        }
        return ResponseEntity.ok().build();
    }
}
