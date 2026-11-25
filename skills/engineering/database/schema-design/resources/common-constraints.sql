CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supply monotonic UUIDv7 for id from application layer (or DEFAULT uuidv7() on PostgreSQL 18+)
CREATE TABLE domain_base_template (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON domain_base_template
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
