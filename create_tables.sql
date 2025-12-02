-- Create game_scores table
CREATE TABLE IF NOT EXISTS game_scores
(
  id
  BIGSERIAL
  PRIMARY
  KEY,
  user_id
  BIGINT
  NOT
  NULL,
  game_type
  VARCHAR
(
  50
) NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  CONSTRAINT fk_user
  FOREIGN KEY
(
  user_id
)
  REFERENCES users
(
  id
)
  );

-- Create index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at);
