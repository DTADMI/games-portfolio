package com.games.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class GamesBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(GamesBackendApplication.class, args);
    }
}
