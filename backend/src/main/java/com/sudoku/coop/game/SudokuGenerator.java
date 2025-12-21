package com.sudoku.coop.game;

import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class SudokuGenerator {
    private static final int N = 9;
    private final Random random = new Random();

    public record SudokuGrid(int[][] solution, int[][] puzzle) {}

    public SudokuGrid generate(int k) {
        System.out.println("DEBUG: Starting Optimized Generation...");
        
        // 1. Start with a known valid base solution
        int[][] baseGrid = new int[N][N];
        fillBaseGrid(baseGrid); // Deterministic valid grid

        // 2. Shuffle it to make it random but valid
        shuffleGrid(baseGrid);

        // 3. Copy to solution
        int[][] solution = new int[N][N];
        for (int i = 0; i < N; i++) {
            System.arraycopy(baseGrid[i], 0, solution[i], 0, N);
        }

        // 4. Remove digits
        removeDigits(baseGrid, k);
        
        System.out.println("DEBUG: Grid Generated Instantly.");
        return new SudokuGrid(solution, baseGrid);
    }

    // Fills a deterministic valid grid
    private void fillBaseGrid(int[][] grid) {
        // Simple shift pattern for valid Sudoku
        // Row 0: 1 2 3 ...
        // Row 1: Shift by 3
        // Row 2: Shift by 3
        // Row 3: Shift by 1 (change band)
        int[] bases = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        
        for (int r = 0; r < N; r++) {
            int shift = (r % 3) * 3 + (r / 3);
            for (int c = 0; c < N; c++) {
                grid[r][c] = bases[(c + shift) % 9];
            }
        }
    }

    private void shuffleGrid(int[][] grid) {
        // Shuffle numbers (e.g. swap all 1s with 9s)
        List<Integer> map = new ArrayList<>();
        for (int i = 1; i <= 9; i++) map.add(i);
        Collections.shuffle(map);
        
        for (int r = 0; r < N; r++) {
            for (int c = 0; c < N; c++) {
                grid[r][c] = map.get(grid[r][c] - 1);
            }
        }

        // Shuffle rows within bands (0-2, 3-5, 6-8)
        for (int b = 0; b < 3; b++) {
            if (random.nextBoolean()) swapRows(grid, b * 3, b * 3 + 1);
            if (random.nextBoolean()) swapRows(grid, b * 3, b * 3 + 2);
        }
        
        // Shuffle cols within bands
        for (int b = 0; b < 3; b++) {
             if (random.nextBoolean()) swapCols(grid, b * 3, b * 3 + 1);
             if (random.nextBoolean()) swapCols(grid, b * 3, b * 3 + 2);
        }
    }

    private void swapRows(int[][] grid, int r1, int r2) {
        int[] temp = grid[r1];
        grid[r1] = grid[r2];
        grid[r2] = temp;
    }

    private void swapCols(int[][] grid, int c1, int c2) {
        for (int r = 0; r < N; r++) {
            int temp = grid[r][c1];
            grid[r][c1] = grid[r][c2];
            grid[r][c2] = temp;
        }
    }

    private void removeDigits(int[][] grid, int count) {
        while (count != 0) {
            int cellId = random.nextInt(N * N);
            int r = cellId / N;
            int c = cellId % N;
            if (grid[r][c] != 0) {
                count--;
                grid[r][c] = 0;
            }
        }
    }
}
