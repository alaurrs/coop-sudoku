package com.sudoku.coop.model;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class GameSession {
    private final String roomId;
    private final int[][] currentGrid;
    private final int[][] solution;
    private final List<String> playerNames = new ArrayList<>();
    private GameState state;
    private Suggestion pendingSuggestion;
    private long startTime;
    private String difficulty;

    public GameSession(String roomId, int[][] currentGrid, int[][] solution, String hostName, GameState state, long startTime, String difficulty) {
        this.roomId = roomId;
        this.currentGrid = currentGrid;
        this.solution = solution;
        this.state = state;
        this.startTime = startTime;
        this.difficulty = difficulty;
        this.playerNames.add(hostName);
    }

    public void addPlayerName(String playerName) {
        if (!playerNames.contains(playerName)) {
            playerNames.add(playerName);
        }
    }
    
    public boolean checkWin() {
        return Arrays.deepEquals(currentGrid, solution);
    }

    // Getters & Setters
    public String getRoomId() { return roomId; }
    public int[][] getCurrentGrid() { return currentGrid; }
    public int[][] getSolution() { return solution; }
    public List<String> getPlayers() { return playerNames; } // Keeping name 'getPlayers' for frontend compatibility
    public GameState getState() { return state; }
    public void setState(GameState state) { this.state = state; }
    public Suggestion getPendingSuggestion() { return pendingSuggestion; }
    public void setPendingSuggestion(Suggestion pendingSuggestion) { this.pendingSuggestion = pendingSuggestion; }
    public long getStartTime() { return startTime; }
    public String getDifficulty() { return difficulty; }
}
