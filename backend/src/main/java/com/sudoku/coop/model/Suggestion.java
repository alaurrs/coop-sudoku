package com.sudoku.coop.model;

public record Suggestion(String suggesterId, String suggesterName, String suggesterAvatar, int row, int col, int value) {}
