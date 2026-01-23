package com.sudoku.coop.model;

public record NoteRequest(String userId, int row, int col, int value) {}
