// backend/src/main/java/com/games/backend/websocket/GameSessionManager.java
@Service
public class GameSessionManager {
    private static final Logger logger = LoggerFactory.getLogger(GameSessionManager.class);

    private final Map<String, GameSession> activeSessions = new ConcurrentHashMap<>();
    private final SimpMessagingTemplate messagingTemplate;
    private final GameService gameService;

    @Scheduled(fixedRate = 5000)
    public void cleanupInactiveSessions() {
        // Clean up inactive sessions
    }

    public GameSession createSession(String gameType, String hostUserId) {
        String sessionId = UUID.randomUUID().toString();
        GameSession session = new GameSession(sessionId, gameType, hostUserId);
        activeSessions.put(sessionId, session);
        return session;
    }

    public void joinSession(String sessionId, String userId) {
        GameSession session = activeSessions.get(sessionId);
        if (session != null && !session.isFull()) {
            session.addPlayer(userId);
            broadcastSessionUpdate(session);
        }
    }

    private void broadcastSessionUpdate(GameSession session) {
        messagingTemplate.convertAndSend("/topic/session/" + session.getId(), session);
    }
}