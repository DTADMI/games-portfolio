package com.games.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
        "app.jwtSecret=test-secret",
        "app.jwtExpirationInMs=2000"
})
class JwtTokenProviderTest {

    @Autowired
    private JwtTokenProvider tokenProvider;

    private UsernamePasswordAuthenticationToken authentication;

    @BeforeEach
    void setUp() {
        UserDetails userDetails = User.withUsername("test@example.com")
                .password("pass")
                .authorities(Collections.emptyList())
                .build();
        authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }

    @Test
    void generateAndValidateToken_success() {
        String token = tokenProvider.generateToken(authentication);
        assertThat(token).isNotBlank();
        assertThat(tokenProvider.validateToken(token)).isTrue();
        assertThat(tokenProvider.getUsernameFromJWT(token)).isEqualTo("test@example.com");
    }

    @Test
    void validateToken_returnsFalseForMalformed() {
        assertThat(tokenProvider.validateToken("not-a-jwt")).isFalse();
    }
}
