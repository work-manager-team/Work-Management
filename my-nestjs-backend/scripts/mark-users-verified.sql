-- Mark all existing users as verified
-- Run this script ONCE after deploying email verification feature

-- Update all users to 'active' status and set emailVerifiedAt
UPDATE users
SET
  status = 'active',
  email_verified_at = created_at,
  updated_at = NOW()
WHERE
  status = 'unverified'
  OR email_verified_at IS NULL;

-- Show results
SELECT
  id,
  email,
  username,
  status,
  email_verified_at,
  created_at
FROM users
ORDER BY id;
