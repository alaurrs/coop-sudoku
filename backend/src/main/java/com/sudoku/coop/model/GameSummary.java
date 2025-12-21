package com.sudoku.coop.model;

import java.time.Instant;

public record GameSummary(
    String roomId,
    String hostId,
    String difficulty,
    String state,
    int playerCount,
    long createdAt
) {}
