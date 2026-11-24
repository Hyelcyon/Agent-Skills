CREATE TABLE account_ledger_history (
    history_id BIGSERIAL PRIMARY KEY,
    account_id UUID NOT NULL,
    balance NUMERIC(14, 4) NOT NULL,
    modified_by TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    CONSTRAINT check_valid_range CHECK (valid_from < valid_to)
);

CREATE INDEX idx_ledger_account_range
ON account_ledger_history (account_id, valid_from, valid_to);
