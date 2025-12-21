package com.sudoku.coop.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class UserEntity {

    @Id
    private String id; // UUID

    @Column(unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash")
    private String passwordHash; // Nullable for guests

    @Column(name = "is_guest")
    private boolean isGuest;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt = Instant.now();

    public UserEntity() {}

    public UserEntity(String username, String passwordHash, boolean isGuest) {
        this.id = java.util.UUID.randomUUID().toString();
        this.username = username;
        this.passwordHash = passwordHash;
        this.isGuest = isGuest;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public boolean isGuest() { return isGuest; }
    public Instant getLastSeenAt() { return lastSeenAt; }
    public void setLastSeenAt(Instant lastSeenAt) { this.lastSeenAt = lastSeenAt; }
}
