// backend/src/test/java/com/games/backend/service/GameServiceTest.java
@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameScoreRepository gameScoreRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GameService gameService;

    @Test
    void saveScore_ValidInput_ReturnsSavedScore() {
        // Given
        String username = "testuser";
        String gameType = "snake";
        int score = 100;

        User user = new User();
        user.setUsername(username);
        user.setEmail("test@example.com");

        GameScore savedScore = new GameScore();
        savedScore.setId(1L);
        savedScore.setUser(user);
        savedScore.setGameType(gameType);
        savedScore.setScore(score);

        when(userRepository.findByUsername(username)).thenReturn(Optional.of(user));
        when(gameScoreRepository.save(any(GameScore.class))).thenReturn(savedScore);

        // When
        GameScore result = gameService.saveScore(username, gameType, score, null);

        // Then
        assertNotNull(result);
        assertEquals(score, result.getScore());
        assertEquals(gameType, result.getGameType());
        assertEquals(user, result.getUser());

        verify(gameScoreRepository).save(any(GameScore.class));
    }
}