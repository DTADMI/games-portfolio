package com.games.backend.realtime;

import com.games.backend.realtime.dto.RealtimeDtos.*;
import com.games.backend.service.ProfanityFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.lang.reflect.Field;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class SnakeRealtimeControllerTest {

    private SimpMessagingTemplate broker;
    private ProfanityFilter profanity;
    private PresenceService presenceService;
    private LeaderboardService leaderboardService;
    private RunIdService runIdService;
    private FeatureFlagsService flags;
    private SnakeRealtimeController controller;

    @BeforeEach
    void setup() {
        broker = mock(SimpMessagingTemplate.class);
        profanity = mock(ProfanityFilter.class);
        presenceService = mock(PresenceService.class);
        leaderboardService = mock(LeaderboardService.class);
        runIdService = mock(RunIdService.class);
        flags = mock(FeatureFlagsService.class);
        when(profanity.filter(anyString())).thenAnswer(inv -> inv.getArgument(0));
        when(flags.isEnabled("realtime_enabled")).thenReturn(true);
        when(flags.isEnabled("anti_cheat_enabled")).thenReturn(false);
        when(leaderboardService.topN(anyString(), anyInt())).thenReturn(List.of());
        controller = new SnakeRealtimeController(broker, profanity, presenceService, leaderboardService, runIdService, flags);
    }

    private void setRealtimeEnabled(boolean v) {
        when(flags.isEnabled("realtime_enabled")).thenReturn(v);
    }

    private static Envelope<PresenceIn> presenceEnv(String nickname, String status) {
        Envelope<PresenceIn> env = new Envelope<>();
        env.type = "presence";
        env.room = new Room();
        env.room.id = "snake:global"; env.room.game = "snake";
        env.user = new User();
        env.user.nickname = nickname; env.user.role = "guest"; env.user.subscription = "free";
        PresenceIn in = new PresenceIn();
        in.status = status;
        env.payload = in;
        return env;
    }

    private static Envelope<ScoreIn> scoreEnv(String nickname, int value) {
        Envelope<ScoreIn> env = new Envelope<>();
        env.type = "score";
        env.room = new Room();
        env.room.id = "snake:global"; env.room.game = "snake";
        env.user = new User();
        env.user.nickname = nickname; env.user.role = "guest"; env.user.subscription = "free";
        ScoreIn in = new ScoreIn();
        in.value = value;
        env.payload = in;
        return env;
    }

    private static Envelope<ChatIn> chatEnv(String nickname, String text) {
        Envelope<ChatIn> env = new Envelope<>();
        env.type = "chat";
        env.room = new Room();
        env.room.id = "snake:global"; env.room.game = "snake";
        env.user = new User();
        env.user.nickname = nickname; env.user.role = "guest"; env.user.subscription = "free";
        ChatIn in = new ChatIn();
        in.text = text;
        env.payload = in;
        return env;
    }

    @Test
    void presence_join_broadcastsCount() {
        controller.presence(presenceEnv("Ari", "join"), null);

        ArgumentCaptor<Envelope> captor = ArgumentCaptor.forClass(Envelope.class);
        verify(broker).convertAndSend(eq("/topic/snake/presence"), captor.capture());
        Envelope<?> sent = captor.getValue();
        assertThat(sent.type).isEqualTo("presence");
        PresenceOut out = (PresenceOut) sent.payload;
        assertThat(out.count).isGreaterThanOrEqualTo(1);
        assertThat(out.users).isNotNull();
    }

    @Test
    void score_oversized_isIgnored() {
        controller.score(scoreEnv("Bo", 1_000_001));
        verify(broker, never()).convertAndSend(eq("/topic/snake/leaderboard"), any());
    }

    @Test
    void score_valid_broadcastsLeaderboard() {
        controller.score(scoreEnv("Bo", 123));
        ArgumentCaptor<Envelope> captor = ArgumentCaptor.forClass(Envelope.class);
        verify(broker).convertAndSend(eq("/topic/snake/leaderboard"), captor.capture());
        Envelope<?> sent = captor.getValue();
        assertThat(sent.type).isEqualTo("leaderboard");
        LeaderboardOut out = (LeaderboardOut) sent.payload;
        assertThat(out.top).extracting(e -> ((Entry)e).nickname).contains("Bo");
    }

    @Test
    void chat_blank_isIgnored() {
        controller.chat(chatEnv("Chen", "   "));
        verify(broker, never()).convertAndSend(eq("/topic/snake/chat"), any());
    }

    @Test
    void chat_filtersProfanity_andBroadcasts() {
        when(profanity.filter("badword here")).thenReturn("******* here");
        controller.chat(chatEnv("Chen", "badword here"));
        ArgumentCaptor<Envelope> captor = ArgumentCaptor.forClass(Envelope.class);
        verify(broker).convertAndSend(eq("/topic/snake/chat"), captor.capture());
        Envelope<?> sent = captor.getValue();
        ChatOut out = (ChatOut) sent.payload;
        assertThat(out.text).contains("*");
    }

    @Test
    void featureFlag_off_preventsBroadcasts() {
        setRealtimeEnabled(false);
        controller.presence(presenceEnv("Ari", "join"), null);
        controller.score(scoreEnv("Bo", 123));
        controller.chat(chatEnv("Chen", "hi"));
        verifyNoInteractions(broker);
    }
}
