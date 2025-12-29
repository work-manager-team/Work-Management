-- Migration script to map old task statuses to new simplified 4-status system
-- Run this BEFORE applying the drizzle migration

-- Mapping logic:
-- 'backlog' -> 'todo'
-- 'todo' -> 'todo'
-- 'in_progress' -> 'in_progress'
-- 'in_review' -> 'in_progress'
-- 'testing' -> 'in_progress'
-- 'blocked' -> 'not_completed'
-- 'done' -> 'done'
-- 'closed' -> 'done'

-- Update existing task statuses
UPDATE tasks SET status = 'todo' WHERE status IN ('backlog', 'todo');
UPDATE tasks SET status = 'in_progress' WHERE status IN ('in_progress', 'in_review', 'testing');
UPDATE tasks SET status = 'done' WHERE status IN ('done', 'closed');
UPDATE tasks SET status = 'not_completed' WHERE status = 'blocked';

-- Show results
SELECT status, COUNT(*) as count
FROM tasks
GROUP BY status
ORDER BY status;
