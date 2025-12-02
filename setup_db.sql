-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users
(
  id
  BIGSERIAL
  PRIMARY
  KEY,
  username
  VARCHAR
(
  50
) UNIQUE NOT NULL,
  email VARCHAR
(
  100
) UNIQUE NOT NULL,
  password VARCHAR
(
  255
) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
                       WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

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
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user
  FOREIGN KEY
(
  user_id
)
  REFERENCES users
(
  id
)
                       ON DELETE CASCADE
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_type ON game_scores(game_type);
CREATE INDEX IF NOT EXISTS idx_game_scores_created_at ON game_scores(created_at);

-- Verify tables were created
SELECT 'users' as table_name,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users') as exists;

SELECT 'game_scores' as table_name,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'game_scores') as exists;
