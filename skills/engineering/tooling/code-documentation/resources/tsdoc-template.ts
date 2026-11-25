/**
 * Processes a financial transaction for a verified customer account.
 *
 * @remarks
 * This method acquires a distributed lock on the account key before balance deduction
 * to prevent double-spending in concurrent webhook environments.
 *
 * @param accountId - Canonical UUIDv7 string identifying the customer account.
 * @param amountCents - Positive integer representing the charge amount in smallest currency units.
 * @param idempotencyKey - Client-supplied UUID guaranteeing request idempotency within a 24-hour window.
 *
 * @returns A promise resolving to the finalized transaction record with server-generated audit timestamp.
 *
 * @throws {@link InsufficientFundsError}
 * Thrown when the account settled balance is strictly less than `amountCents`.
 *
 * @throws {@link ConcurrentMutationError}
 * Thrown if the distributed account lock cannot be acquired within the implementation's lock timeout budget.
 */
interface TransactionProcessor {
  processCharge(
    accountId: string,
    amountCents: number,
    idempotencyKey: string
  ): Promise<{ transactionId: string; settledAt: Date }>;
}

export type { TransactionProcessor };
