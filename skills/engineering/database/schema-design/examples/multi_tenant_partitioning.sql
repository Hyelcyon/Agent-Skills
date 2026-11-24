CREATE TABLE tenant_events (
    id UUID NOT NULL,
    tenant_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (tenant_id, id, created_at)
) PARTITION BY LIST (tenant_id);

CREATE TABLE tenant_events_t1 PARTITION OF tenant_events
    FOR VALUES IN ('tenant_enterprise_alpha');

CREATE TABLE tenant_events_t2 PARTITION OF tenant_events
    FOR VALUES IN ('tenant_enterprise_beta');

CREATE TABLE tenant_events_default PARTITION OF tenant_events
    DEFAULT;
