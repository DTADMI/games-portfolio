package com.games.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @Bean
    public FirebaseAuth firebaseAuth() throws IOException {
        String firebaseConfig = System.getenv("FIREBASE_CONFIG");
        
        if (firebaseConfig == null || firebaseConfig.isEmpty()) {
            throw new IllegalStateException("FIREBASE_CONFIG environment variable is not set");
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials
                        .fromStream(new ByteArrayInputStream(firebaseConfig.getBytes(StandardCharsets.UTF_8))))
                .build();

        FirebaseApp.initializeApp(options);
        return FirebaseAuth.getInstance();
    }
}
