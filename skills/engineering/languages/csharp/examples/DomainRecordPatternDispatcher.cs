namespace Enterprise.Core.Domain;

public sealed interface IPaymentState
{
    public sealed record Pending(Guid TransactionId, decimal Amount, DateTime CreatedAtUtc) : IPaymentState;
    public sealed record Authorized(Guid TransactionId, string AuthorizationCode, DateTime AuthorizedAtUtc) : IPaymentState;
    public sealed record Captured(Guid TransactionId, string ReceiptNumber, DateTime CapturedAtUtc) : IPaymentState;
    public sealed record Rejected(Guid TransactionId, string ReasonCode, string Message) : IPaymentState;
}

public sealed record PaymentSummary
{
    public required Guid TransactionId { get; init; }
    public required string StatusDescription { get; init; }
    public required bool IsTerminalState { get; init; }
}

public sealed class DomainRecordPatternDispatcher
{
    public static PaymentSummary EvaluateState(IPaymentState state) => state switch
    {
        IPaymentState.Pending p => new PaymentSummary
        {
            TransactionId = p.TransactionId,
            StatusDescription = $"Pending authorization for amount {p.Amount:C}",
            IsTerminalState = false
        },
        IPaymentState.Authorized a => new PaymentSummary
        {
            TransactionId = a.TransactionId,
            StatusDescription = $"Authorized with code {a.AuthorizationCode}",
            IsTerminalState = false
        },
        IPaymentState.Captured c => new PaymentSummary
        {
            TransactionId = c.TransactionId,
            StatusDescription = $"Captured under receipt {c.ReceiptNumber}",
            IsTerminalState = true
        },
        IPaymentState.Rejected r => new PaymentSummary
        {
            TransactionId = r.TransactionId,
            StatusDescription = $"Rejected: [{r.ReasonCode}] {r.Message}",
            IsTerminalState = true
        }
    };
}
