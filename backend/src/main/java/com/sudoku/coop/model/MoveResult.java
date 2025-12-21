package com.sudoku.coop.model;

public record MoveResult(int row, int col, int value, boolean isCorrect, boolean isWin) {}
