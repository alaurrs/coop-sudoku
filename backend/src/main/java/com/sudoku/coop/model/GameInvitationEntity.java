package com.sudoku.coop.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "invitations")
public class GameInvitationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inviterId;
    private String inviteeId;
    private String roomCode;
    private String status; // PENDING, ACCEPTED, REJECTED
    private Instant createdAt;

    public GameInvitationEntity() {}
    public GameInvitationEntity(String inviterId, String inviteeId, String roomCode) {
        this.inviterId = inviterId;
        this.inviteeId = inviteeId;
        this.roomCode = roomCode;
        this.status = "PENDING";
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getInviterId() { return inviterId; }
    public String getRoomCode() { return roomCode; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
