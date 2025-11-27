// backend/src/main/java/com/games/backend/graphql/QueryResolver.java
@RequiredArgsConstructor
@Component
public class QueryResolver implements GraphQLQueryResolver {
    private final GameScoreRepository gameScoreRepository;
    private final UserRepository userRepository;

    public List<GameScore> gameScores(String gameType, Integer limit) {
        Pageable pageable = limit != null ?
                PageRequest.of(0, limit, Sort.by("score").descending()) :
                Pageable.unpaged();

        return gameScoreRepository.findByGameType(gameType, pageable);
    }

    public List<LeaderboardEntry> leaderboard(String gameType, Integer limit) {
        int limitValue = limit != null ? limit : 10;
        return gameScoreRepository.findLeaderboard(gameType, limitValue);
    }

    // Other query methods...
}

// backend/src/main/java/com/games/backend/graphql/MutationResolver.java
@RequiredArgsConstructor
@Component
public class MutationResolver implements GraphQLMutationResolver {
    private final GameService gameService;
    private final UserService userService;

    public GameScore submitScore(ScoreInput input) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        return gameService.saveScore(
                username,
                input.getGameType(),
                input.getScore(),
                input.getMetadata()
        );
    }

    // Other mutation methods...
}