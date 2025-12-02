-- Check if users table exists
SELECT 'users' as table_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as exists;

-- Check if game_scores table exists
SELECT 'game_scores' as table_name,
       EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_scores') as exists;
