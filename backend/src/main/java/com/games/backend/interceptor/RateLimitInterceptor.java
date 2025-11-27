// src/main/java/com/games/backend/interceptor/RateLimitInterceptor.java
package com.games.backend.interceptor;

import io.github.bucket4j.Bucket;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Bucket bucket;

    public RateLimitInterceptor(Bucket apiRateLimiter) {
        this.bucket = apiRateLimiter;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (bucket.tryConsume(1)) {
            return true;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setHeader("Retry-After", String.valueOf(TimeUnit.MINUTES.toSeconds(1)));
        response.getWriter().write("Too many requests. Please try again later.");
        return false;
    }
}