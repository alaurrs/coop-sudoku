-- Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- Nullable for guests
    is_guest BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Games Table
CREATE TABLE games (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    room_code VARCHAR(6) NOT NULL UNIQUE,
    difficulty VARCHAR(20) NOT NULL, -- 'EASY', 'MEDIUM', 'HARD'
    initial_grid JSONB NOT NULL, -- The puzzle at start
    solution_grid JSONB NOT NULL, -- The solution (kept server side)
    current_grid JSONB NOT NULL, -- Current state of board
    status VARCHAR(20) NOT NULL, -- 'WAITING', 'IN_PROGRESS', 'COMPLETED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game Players Link Table (Many-to-Many)
CREATE TABLE game_players (
    game_id VARCHAR(36) REFERENCES games(id),
    user_id VARCHAR(36) REFERENCES users(id),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (game_id, user_id)
);

-- Index for room lookup
CREATE INDEX idx_games_room_code ON games(room_code);
