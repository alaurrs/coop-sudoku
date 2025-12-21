package com.sudoku.coop.model;

public record SuggestionRequest(String userId, int row, int col, int value) {}
