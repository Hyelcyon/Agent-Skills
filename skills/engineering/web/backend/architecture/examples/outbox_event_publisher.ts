interface OutboxEvent {
  id: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: string;
  status: 'PENDING' | 'PUBLISHED' | 'FAILED';
  createdAt: string;
}

export class TransactionalOutboxManager {
  private pendingOutbox: OutboxEvent[] = [];

  recordEvent(aggregateType: string, aggregateId: string, eventType: string, payload: Record<string, unknown>): OutboxEvent {
    const event: OutboxEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      aggregateType,
      aggregateId,
      eventType,
      payload: JSON.stringify(payload),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.pendingOutbox.push(event);
    return event;
  }

  async flushEvents(publisher: (event: OutboxEvent) => Promise<boolean>): Promise<number> {
    let publishedCount = 0;

    for (const event of this.pendingOutbox) {
      if (event.status === 'PENDING') {
        try {
          const success = await publisher(event);
          if (success) {
            event.status = 'PUBLISHED';
            publishedCount += 1;
          } else {
            event.status = 'FAILED';
          }
        } catch {
          event.status = 'FAILED';
        }
      }
    }

    return publishedCount;
  }

  getPendingCount(): number {
    return this.pendingOutbox.filter((e) => e.status === 'PENDING').length;
  }
}
