package com.sudoku.coop.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "friend_requests", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"sender_id", "receiver_id"})
})
public class FriendRequestEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private String senderId;

    @Column(name = "receiver_id", nullable = false)
    private String receiverId;

    @Column(nullable = false)
    private String status; // PENDING, ACCEPTED, REJECTED

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public FriendRequestEntity() {}

    public FriendRequestEntity(String senderId, String receiverId) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.status = "PENDING";
    }

    public Long getId() { return id; }
    public String getSenderId() { return senderId; }
    public String getReceiverId() { return receiverId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
