// backend/src/test/java/com/games/backend/controller/GameControllerIT.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@ActiveProfiles("test")
class GameControllerIT {

    @Container
    private static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:15-alpine")
                    .withDatabaseName("testdb")
                    .withUsername("test")
                    .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    void submitScore_AuthenticatedUser_ReturnsCreated() {
        // Given
        String token = createTestToken("testuser");
        ScoreRequest request = new ScoreRequest("snake", 100, null);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<ScoreRequest> entity = new HttpEntity<>(request, headers);

        // When
        ResponseEntity<GameScore> response = restTemplate.exchange(
                "/api/scores",
                HttpMethod.POST,
                entity,
                GameScore.class
        );

        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(100, response.getBody().getScore());
    }

    private String createTestToken(String username) {
        UserDetails userDetails = User.withUsername(username)
                .password("password")
                .roles("USER")
                .build();

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());

        return tokenProvider.generateToken(authentication);
    }
}