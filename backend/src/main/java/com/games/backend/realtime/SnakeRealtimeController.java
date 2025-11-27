package com.games.backend.realtime;

import com.games.backend.realtime.dto.RealtimeDtos.*;
import com.games.backend.service.ProfanityFilter;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;

import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Validated
@Controller
public class SnakeRealtimeController {

    private final SimpMessagingTemplate broker;
    private final ProfanityFilter profanityFilter;

    @Value("${features.realtimeEnabled:true}")
    private boolean realtimeEnabled;

    public SnakeRealtimeController(SimpMessagingTemplate broker, ProfanityFilter profanityFilter) {
        this.broker = broker;
        this.profanityFilter = profanityFilter;
    }

    // In-memory presence and leaderboard (swap with Redis later)
    private final Set<String> online = Collections.newSetFromMap(new ConcurrentHashMap<>());
    private final ConcurrentMap<String, Integer> leaderboard = new ConcurrentHashMap<>(); // nickname -> best

    @MessageMapping("/snake/presence")
    public void presence(@Valid @Payload Envelope<@Valid PresenceIn> env, Principal principal) {
        if (!realtimeEnabled || env == null) return;
        String userKey = principal != null && principal.getName() != null ? principal.getName() : UUID.randomUUID().toString();
        if (env.user != null && env.user.nickname != null) {
            userKey = env.user.nickname + "|" + userKey;
        }
        String status = env.payload != null ? env.payload.status : "heartbeat";
        switch (status == null ? "heartbeat" : status) {
            case "join" -> online.add(userKey);
            case "leave" -> online.remove(userKey);
            default -> online.add(userKey);
        }
        PresenceOut out = new PresenceOut();
        out.count = online.size();
        out.users = online.stream().limit(20).map(k -> {
            PublicUser pu = new PublicUser();
            pu.id = k;
            pu.nickname = k.split("\\|")[0];
            return pu;
        }).collect(Collectors.toList());

        Envelope<PresenceOut> res = new Envelope<>();
        res.type = "presence";
        res.room = env.room;
        res.user = env.user;
        res.payload = out;
        broker.convertAndSend("/topic/snake/presence", res);
    }

    @MessageMapping("/snake/score")
    public void score(@Valid @Payload Envelope<@Valid ScoreIn> env) {
        if (!realtimeEnabled || env == null || env.user == null || env.user.nickname == null || env.payload == null) return;
        int value = Math.max(0, env.payload.value);
        // Heuristic anti-cheat: clamp max and ignore obviously invalid
        if (value > 1000000) return;
        leaderboard.merge(env.user.nickname, value, Math::max);
        List<Entry> top = leaderboard.entrySet().stream()
                .sorted((a,b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(10)
                .map(e -> { Entry en = new Entry(); en.nickname = e.getKey(); en.value = e.getValue(); return en; })
                .collect(Collectors.toList());
        LeaderboardOut out = new LeaderboardOut();
        out.top = top;
        Integer yourRank = null;
        int idx = 1;
        for (Map.Entry<String,Integer> e : leaderboard.entrySet().stream().sorted((a,b) -> Integer.compare(b.getValue(), a.getValue())).toList()) {
            if (e.getKey().equals(env.user.nickname)) { yourRank = idx; break; }
            idx++;
        }
        out.yourRank = yourRank;

        Envelope<LeaderboardOut> res = new Envelope<>();
        res.type = "leaderboard";
        res.room = env.room;
        res.user = env.user;
        res.payload = out;
        broker.convertAndSend("/topic/snake/leaderboard", res);
    }

    @MessageMapping("/snake/chat")
    public void chat(@Valid @Payload Envelope<@Valid ChatIn> env) {
        if (!realtimeEnabled || env == null || env.user == null || env.user.nickname == null || env.payload == null) return;
        String text = env.payload.text == null ? "" : env.payload.text.trim();
        if (text.isBlank()) return;
        text = profanityFilter.filter(text);
        if (text.length() > 300) {
            text = text.substring(0, 300);
        }
        ChatOut out = new ChatOut();
        out.nickname = env.user.nickname;
        out.text = text;
        Envelope<ChatOut> res = new Envelope<>();
        res.type = "chat";
        res.room = env.room;
        res.user = env.user;
        res.payload = out;
        broker.convertAndSend("/topic/snake/chat", res);
    }
}
