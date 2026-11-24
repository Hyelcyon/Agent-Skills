interface Order {
  id: string;
  customerId: string;
  totalAmountCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: Date;
}

interface OrderRepositoryPort {
  findById(id: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
}

interface PaymentGatewayPort {
  charge(customerId: string, amountCents: number): Promise<{ success: boolean; transactionId: string }>;
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
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    if (order.status !== 'PENDING') {
      throw new Error(`Order cannot be completed from status ${order.status}`);
    }

    const paymentResult = await this.paymentGateway.charge(
      order.customerId,
      order.totalAmountCents
    );

    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    const updatedOrder: Order = {
      ...order,
      status: 'PAID'
    };

    await this.orderRepo.save(updatedOrder);
    return updatedOrder;
  }
}

export { OrderService };
export type { Order, OrderRepositoryPort, PaymentGatewayPort };
