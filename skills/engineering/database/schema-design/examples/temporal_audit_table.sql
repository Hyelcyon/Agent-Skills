CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enforces non-overlapping half-open intervals [valid_from, valid_to) per account
CREATE TABLE account_ledger_history (
    history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id UUID NOT NULL,
    balance NUMERIC(14, 4) NOT NULL,
    modified_by TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL DEFAULT 'infinity'::timestamptz,
    CONSTRAINT check_valid_range CHECK (valid_from < valid_to),
    CONSTRAINT excl_ledger_account_no_overlap EXCLUDE USING gist (
        account_id WITH =,
        tstzrange(valid_from, valid_to, '[)') WITH &&
    )
);

CREATE INDEX idx_ledger_account_range
ON account_ledger_history (account_id, valid_from, valid_to);
