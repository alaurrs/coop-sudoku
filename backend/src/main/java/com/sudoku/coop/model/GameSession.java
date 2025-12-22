package com.sudoku.coop.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GameSession {
    private final String roomId;
    private final int[][] currentGrid;
    private final int[][] solution;
    private final List<PlayerInfo> players = new ArrayList<>();
    private GameState state;
    private Suggestion pendingSuggestion;
    private long startTime;
    private Long completedTime;
    private String difficulty;

    public record PlayerInfo(String id, String username, String avatar) {}

    public GameSession(String roomId, int[][] currentGrid, int[][] solution, PlayerInfo host, GameState state, long startTime, Long completedTime, String difficulty) {
        this.roomId = roomId;
        this.currentGrid = currentGrid;
        this.solution = solution;
        this.state = state;
        this.startTime = startTime;
        this.completedTime = completedTime;
        this.difficulty = difficulty;
        this.players.add(host);
    }

    public void addPlayer(PlayerInfo player) {
        if (players.stream().noneMatch(p -> p.id().equals(player.id()))) {
            players.add(player);
        }
    }
    
    public boolean checkWin() {
        return Arrays.deepEquals(currentGrid, solution);
    }

    // Getters & Setters
    public String getRoomId() { return roomId; }
    public int[][] getCurrentGrid() { return currentGrid; }
    public int[][] getSolution() { return solution; }
    public List<PlayerInfo> getPlayers() { return players; }
    public GameState getState() { return state; }
    public void setState(GameState state) { this.state = state; }
    public Suggestion getPendingSuggestion() { return pendingSuggestion; }
    public void setPendingSuggestion(Suggestion pendingSuggestion) { this.pendingSuggestion = pendingSuggestion; }
    public long getStartTime() { return startTime; }
    public Long getCompletedTime() { return completedTime; }
    public String getDifficulty() { return difficulty; }
}
