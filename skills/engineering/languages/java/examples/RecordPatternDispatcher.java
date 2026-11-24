package engineering.languages.java.examples;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public final class RecordPatternDispatcher {

    public sealed interface DomainEvent permits OrderPlaced, PaymentProcessed, OrderCancelled, ShipmentDispatched {
        UUID eventId();
        Instant occurredAt();
    }

    public record Customer(UUID customerId, String email, Address address) {
        public Customer {
            Objects.requireNonNull(customerId, "customerId must not be null");
            Objects.requireNonNull(email, "email must not be null");
            Objects.requireNonNull(address, "address must not be null");
        }
    }

    public record Address(String street, String city, String postalCode, String country) {
        public Address {
            Objects.requireNonNull(street, "street must not be null");
            Objects.requireNonNull(city, "city must not be null");
            Objects.requireNonNull(postalCode, "postalCode must not be null");
            Objects.requireNonNull(country, "country must not be null");
        }
    }

    public record Money(BigDecimal amount, String currency) {
        public Money {
            Objects.requireNonNull(amount, "amount must not be null");
            Objects.requireNonNull(currency, "currency must not be null");
            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Amount cannot be negative");
            }
        }
    }

    public record OrderPlaced(
        UUID eventId,
        Instant occurredAt,
        UUID orderId,
        Customer customer,
        Money total
    ) implements DomainEvent {}

    public record PaymentProcessed(
        UUID eventId,
        Instant occurredAt,
        UUID orderId,
        UUID transactionId,
        Money paymentAmount,
        String paymentMethod
    ) implements DomainEvent {}

    public record OrderCancelled(
        UUID eventId,
        Instant occurredAt,
        UUID orderId,
        String reason
    ) implements DomainEvent {}

    public record ShipmentDispatched(
        UUID eventId,
        Instant occurredAt,
        UUID orderId,
        String trackingCode,
        Address destination
    ) implements DomainEvent {}

    public sealed interface DispatchResult permits Success, RequiresAudit, Rejected {
        UUID eventId();
        String summary();
    }

    public record Success(UUID eventId, String summary) implements DispatchResult {}
    public record RequiresAudit(UUID eventId, String summary, BigDecimal threshold) implements DispatchResult {}
    public record Rejected(UUID eventId, String summary, String reason) implements DispatchResult {}

    public DispatchResult dispatch(DomainEvent event) {
        Objects.requireNonNull(event, "event must not be null");

        return switch (event) {
            case OrderPlaced(var id, var time, var orderId, Customer(var custId, var email, Address(var street, var city, var zip, var country)), Money(var amount, var currency))
                when amount.compareTo(new BigDecimal("100000.00")) >= 0 ->
                new RequiresAudit(id, "High-value order for " + email + " in " + city, amount);

            case OrderPlaced(var id, var time, var orderId, Customer(var custId, var email, var address), Money(var amount, var currency)) ->
                new Success(id, "Order " + orderId + " accepted for " + email + " (" + amount + " " + currency + ")");

            case PaymentProcessed(var id, var time, var orderId, var txId, Money(var amount, var currency), var method)
                when "WIRE_TRANSFER".equalsIgnoreCase(method) && amount.compareTo(new BigDecimal("50000.00")) >= 0 ->
                new RequiresAudit(id, "Wire transfer audit required for tx " + txId, amount);

            case PaymentProcessed(var id, var time, var orderId, var txId, Money(var amount, var currency), var method) ->
                new Success(id, "Payment " + txId + " processed via " + method);

            case OrderCancelled(var id, var time, var orderId, var reason)
                when reason != null && reason.contains("FRAUD_SUSPECTED") ->
                new Rejected(id, "Cancellation flagged for security inspection", reason);

            case OrderCancelled(var id, var time, var orderId, var reason) ->
                new Success(id, "Order " + orderId + " cancelled: " + reason);

            case ShipmentDispatched(var id, var time, var orderId, var tracking, Address(var street, var city, var zip, "US")) ->
                new Success(id, "Domestic shipment dispatched for order " + orderId + " with tracking " + tracking);

            case ShipmentDispatched(var id, var time, var orderId, var tracking, Address(var street, var city, var zip, var country)) ->
                new Success(id, "International shipment dispatched to " + country + " with tracking " + tracking);
        };
    }
}
