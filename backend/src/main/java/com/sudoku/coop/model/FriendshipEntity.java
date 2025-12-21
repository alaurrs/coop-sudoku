package com.sudoku.coop.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "friendships", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "friend_id"})
})
public class FriendshipEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "friend_id", nullable = false)
    private String friendId;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public FriendshipEntity() {}

    public FriendshipEntity(String userId, String friendId) {
        this.userId = userId;
        this.friendId = friendId;
    }

    public Long getId() { return id; }
    public String getUserId() { return userId; }
    public String getFriendId() { return friendId; }
}