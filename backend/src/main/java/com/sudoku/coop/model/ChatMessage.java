package com.sudoku.coop.model;

public record ChatMessage(String userId, String username, String avatar, String message, long timestamp) {}
