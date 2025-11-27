package com.games.backend.feature;

import org.ff4j.FF4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeatureConfig {

    public static final String NEW_UI = "new-ui";

    @Bean
    CommandLineRunner initFeatures(FF4j ff4j) {
        return args -> {
            if (!ff4j.exist(NEW_UI)) {
                ff4j.createFeature(NEW_UI, true);
            }
        };
    }
}
