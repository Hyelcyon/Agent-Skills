namespace Enterprise.Core.Domain;

using System.Diagnostics;
using System.Globalization;

public abstract record PaymentState
{
    private PaymentState() { }

    public sealed record Pending(Guid TransactionId, decimal Amount, DateTime CreatedAtUtc) : PaymentState;
    public sealed record Authorized(Guid TransactionId, string AuthorizationCode, DateTime AuthorizedAtUtc) : PaymentState;
    public sealed record Captured(Guid TransactionId, string ReceiptNumber, DateTime CapturedAtUtc) : PaymentState;
    public sealed record Rejected(Guid TransactionId, string ReasonCode, string Message) : PaymentState;
}

public sealed record PaymentSummary
{
    public required Guid TransactionId { get; init; }
    public required string StatusDescription { get; init; }
    public required bool IsTerminalState { get; init; }
}

public static class DomainRecordPatternDispatcher
{
    public static PaymentSummary EvaluateState(PaymentState state) => state switch
    {
        PaymentState.Pending p => new PaymentSummary
        {
            TransactionId = p.TransactionId,
            StatusDescription = string.Create(CultureInfo.InvariantCulture, $"Pending authorization for amount {p.Amount:0.00}"),
            IsTerminalState = false
        },
        PaymentState.Authorized a => new PaymentSummary
        {
            TransactionId = a.TransactionId,
            StatusDescription = $"Authorized with code {a.AuthorizationCode}",
            IsTerminalState = false
        },
        PaymentState.Captured c => new PaymentSummary
        {
            TransactionId = c.TransactionId,
            StatusDescription = $"Captured under receipt {c.ReceiptNumber}",
            IsTerminalState = true
        },
        PaymentState.Rejected r => new PaymentSummary
        {
            TransactionId = r.TransactionId,
            StatusDescription = $"Rejected: [{r.ReasonCode}] {r.Message}",
            IsTerminalState = true
        },
        _ => throw new UnreachableException($"Unhandled payment state: {state}")
    };
}
