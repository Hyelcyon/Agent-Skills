interface Order {
  id: string;
  customerId: string;
  totalAmountCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  version: number;
  createdAt: Date;
}

interface OrderRepositoryPort {
  findById(id: string): Promise<Order | null>;
  saveIfVersionMatches(order: Order, expectedVersion: number): Promise<boolean>;
}

interface PaymentGatewayPort {
  charge(
    customerId: string,
    amountCents: number,
    idempotencyKey: string
  ): Promise<{ success: boolean; transactionId: string }>;
}

class OrderService {
  private readonly orderRepo: OrderRepositoryPort;
  private readonly paymentGateway: PaymentGatewayPort;

  constructor(
    orderRepo: OrderRepositoryPort,
    paymentGateway: PaymentGatewayPort
  ) {
    this.orderRepo = orderRepo;
    this.paymentGateway = paymentGateway;
  }

  async completeOrder(orderId: string): Promise<Order> {
    if (!orderId) {
      throw new RangeError('orderId must be non-empty');
    }

    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Order cannot be completed from status ${order.status}`);
    }

    // Deterministic idempotency key ensures retries after DB persistence faults never double-charge
    const paymentResult = await this.paymentGateway.charge(
      order.customerId,
      order.totalAmountCents,
      `order-payment:${order.id}:v${order.version}`
    );

    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    const updatedOrder: Order = {
      ...order,
      status: 'PAID',
      version: order.version + 1
    };

    const saved = await this.orderRepo.saveIfVersionMatches(updatedOrder, order.version);
    if (!saved) {
      throw new Error(`Concurrent modification conflict while completing order ${orderId}`);
    }

    return updatedOrder;
  }
}

export { OrderService };
export type { Order, OrderRepositoryPort, PaymentGatewayPort };
