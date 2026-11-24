SET lock_timeout = '5s';
SET statement_timeout = '30s';

DROP TRIGGER IF EXISTS sync_v1_to_v2 ON users;
DROP FUNCTION IF EXISTS sync_users_column();

ALTER TABLE users DROP COLUMN IF EXISTS new_field_name;
