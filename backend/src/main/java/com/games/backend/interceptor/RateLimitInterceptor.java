package com.games.backend.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Minimal no-op interceptor used by {@link com.games.backend.config.WebMvcConfig}.
 * Real rate limiting is handled elsewhere (e.g., filters/Resilience4j).
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
    return true; // allow all requests
  }
}
