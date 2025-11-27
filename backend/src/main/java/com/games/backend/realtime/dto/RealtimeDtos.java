package com.games.backend.realtime.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class RealtimeDtos {
    public static class Envelope<T> {
        public String eventId = UUID.randomUUID().toString();
        public String type;
        public long ts = Instant.now().toEpochMilli();
        public Room room;
        public User user;
        public T payload;
    }

    public static class Room {
        public String id;      // e.g. "snake:global"
        public String game;    // e.g. "snake"
        public String visibility = "public";
    }

    public static class User {
        public String id;
        public String role = "guest"; // guest|user|mod|admin
        public String nickname;
        public String subscription = "free"; // free|monthly|yearly|lifetime
    }

    // Presence
    public static class PresenceIn {
        public String status; // join|leave|heartbeat
    }
    public static class PresenceOut {
        public int count;
        public List<PublicUser> users;
    }
    public static class PublicUser {
        public String id;
        public String nickname;
    }

    // Score
    public static class ScoreIn {
        public int value;
        public String runId;
        public String proof;
    }
    public static class LeaderboardOut {
        public List<Entry> top;
        public Integer yourRank;
    }
    public static class Entry {
        public String nickname;
        public int value;
    }

    // Chat
    public static class ChatIn {
        public String text;
    }
    public static class ChatOut {
        public String nickname;
        public String text;
    }
}
