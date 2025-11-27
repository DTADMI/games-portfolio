package com.games.backend.controller;

import com.games.backend.BaseIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class AuthControllerIT extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void signupThenLoginReturnsJwt() {
        // Signup
        Map<String, String> signup = Map.of(
                "username", "ituser",
                "email", "ituser@example.com",
                "password", "Password123!"
        );
        ResponseEntity<String> signupResp = restTemplate.postForEntity("/api/auth/signup", signup, String.class);
        assertEquals(HttpStatus.OK, signupResp.getStatusCode());

        // Login
        Map<String, String> login = Map.of(
                "email", "ituser@example.com",
                "password", "Password123!"
        );
        ResponseEntity<Map> loginResp = restTemplate.postForEntity("/api/auth/login", login, Map.class);
        assertEquals(HttpStatus.OK, loginResp.getStatusCode());
        assertNotNull(loginResp.getBody());
        assertTrue(loginResp.getBody().containsKey("accessToken"));
        assertEquals("Bearer", loginResp.getBody().get("tokenType"));

        // Access token format sanity
        String token = (String) loginResp.getBody().get("accessToken");
        assertFalse(token.isBlank());
    }
}
