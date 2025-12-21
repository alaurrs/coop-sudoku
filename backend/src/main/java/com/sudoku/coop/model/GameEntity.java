package com.sudoku.coop.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;

@Entity
@Table(name = "games")
public class GameEntity {

    @Id
    private String id; // UUID

    @Column(name = "room_code", unique = true, nullable = false)
    private String roomCode;

    private String difficulty;

    @Column(name = "created_at")
    private Instant createdAt;

    private String hostId;
    private String player2Id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GameState state;

    @Column(name = "initial_grid", columnDefinition = "TEXT")
    private String puzzleGrid; 

    @Column(name = "solution_grid", columnDefinition = "TEXT")
    private String solutionGrid;

    @Column(name = "current_grid", columnDefinition = "TEXT")
    private String currentGrid;

    public GameEntity() {}

    public GameEntity(String roomCode, String hostId, int[][] puzzle, int[][] solution, String difficulty) {
        this.id = java.util.UUID.randomUUID().toString();
        this.roomCode = roomCode;
        this.hostId = hostId;
        this.state = GameState.WAITING;
        this.difficulty = difficulty;
        this.createdAt = Instant.now();
        this.puzzleGrid = serializeGrid(puzzle);
        this.solutionGrid = serializeGrid(solution);
        this.currentGrid = serializeGrid(puzzle);
    }

    // Converters
    public int[][] getCurrentGridArray() { return deserializeGrid(currentGrid); }
    public int[][] getSolutionGridArray() { return deserializeGrid(solutionGrid); }
    
    public void setCurrentGridArray(int[][] grid) {
        this.currentGrid = serializeGrid(grid);
    }

    private String serializeGrid(int[][] grid) {
        return Arrays.stream(grid)
            .map(row -> Arrays.stream(row)
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(",")))
            .collect(Collectors.joining(";"));
    }

    private int[][] deserializeGrid(String data) {
        if (data == null || data.isEmpty()) return new int[9][9];
        return Arrays.stream(data.split(";"))
            .map(row -> Arrays.stream(row.split(","))
                .mapToInt(Integer::parseInt)
                .toArray())
            .toArray(int[][]::new);
    }

    // Getters & Setters
    public String getId() { return id; }
    public String getRoomCode() { return roomCode; }
    public String getHostId() { return hostId; }
    public String getPlayer2Id() { return player2Id; }
    public void setPlayer2Id(String player2Id) { this.player2Id = player2Id; }
    public GameState getState() { return state; }
    public void setState(GameState state) { this.state = state; }
    public Instant getCreatedAt() { return createdAt; }
    public String getDifficulty() { return difficulty; }
}