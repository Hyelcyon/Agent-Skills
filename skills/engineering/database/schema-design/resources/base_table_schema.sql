-- Supply monotonic UUIDv7 for id from application layer (or DEFAULT uuidv7() on PostgreSQL 18+)
CREATE TABLE entity_base (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INT NOT NULL DEFAULT 1 CHECK (version >= 1)
);
