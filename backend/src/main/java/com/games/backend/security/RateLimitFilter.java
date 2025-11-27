// backend/src/main/java/com/games/backend/security/RateLimitFilter.java
public class RateLimitFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(RateLimitFilter.class);
    private final RateLimiterRegistry rateLimiterRegistry;
    private final List<String> excludedPaths = List.of("/actuator/health", "/error");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        if (excludedPaths.stream().anyMatch(requestUri::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIP(request);
        String key = "rate_limit:" + clientIp + ":" + requestUri;

        RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(key, () ->
                RateLimiterConfig.custom()
                        .limitForPeriod(100)
                        .limitRefreshPeriod(Duration.ofMinutes(1))
                        .timeoutDuration(Duration.ofSeconds(5))
                        .build()
        );

        try {
            boolean permission = rateLimiter.acquirePermission();
            if (permission) {
                filterChain.doFilter(request, response);
            } else {
                rateLimitExceeded(response, clientIp, requestUri);
            }
        } catch (Exception e) {
            handleRateLimitError(response, e);
        }
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null) {
            return xfHeader.split(",")[0];
        }
        return request.getRemoteAddr();
    }

    private void rateLimitExceeded(HttpServletResponse response, String clientIp, String requestUri) throws IOException {
        String requestUri = request.getRequestURI();
        logger.warn("Rate limit exceeded for {} - {}", clientIp, requestUri);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
            {
                "error": "Too many requests",
                "message": "Rate limit exceeded. Please try again later."
            }
            """);
    }

    private void handleRateLimitError(HttpServletResponse response, Exception e) throws IOException {
        log.error("Rate limiting error", e);
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("""
            {
                "error": "Internal server error",
                "message": "An error occurred while processing your request."
            }
            """);
    }
}