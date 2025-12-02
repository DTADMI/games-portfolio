package com.games.backend;

import com.games.backend.config.FirebaseConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.games.backend")
@EntityScan("com.games.backend.model")
@EnableJpaRepositories("com.games.backend.repository")
@EnableCaching
@EnableConfigurationProperties(FirebaseConfig.class)
public class GamesBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(GamesBackendApplication.class, args);
    }
}
