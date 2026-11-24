SET lock_timeout = '2s';

ALTER TABLE target_table
ADD COLUMN new_column_name TEXT;

CREATE INDEX CONCURRENTLY idx_target_new_column
ON target_table (new_column_name);

ALTER TABLE target_table
ADD CONSTRAINT chk_new_column_valid
CHECK (new_column_name IS NOT NULL)
NOT VALID;
