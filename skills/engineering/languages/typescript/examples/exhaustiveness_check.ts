export type PaymentMethod =
  | { type: 'CREDIT_CARD'; cardNumber: string }
  | { type: 'BANK_TRANSFER'; iban: string }
  | { type: 'CRYPTO'; walletAddress: string };

export function assertUnreachable(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

export function formatPaymentSummary(payment: PaymentMethod): string {
  switch (payment.type) {
    case 'CREDIT_CARD':
      return `Credit Card: ending in ${payment.cardNumber.slice(-4)}`;
    case 'BANK_TRANSFER':
      return `Bank Transfer: ${payment.iban}`;
    case 'CRYPTO':
      return `Crypto Wallet: ${payment.walletAddress}`;
    default:
      return assertUnreachable(payment);
  }
}
