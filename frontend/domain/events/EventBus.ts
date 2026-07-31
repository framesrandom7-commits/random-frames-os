type EventHandler<T = any> = (payload: T) => void | Promise<void>;

/**
 * A lightweight internal Domain Event Bus for decoupling domains.
 * Usage:
 * EventBus.on('LEAD_CONVERTED', async ({ leadId }) => { ... });
 * EventBus.emit('LEAD_CONVERTED', { leadId: '123' });
 */
export class EventBus {
  private static handlers: Map<string, EventHandler[]> = new Map();

  static on<T>(event: string, handler: EventHandler<T>) {
    const existing = this.handlers.get(event) || [];
    this.handlers.set(event, [...existing, handler]);
  }

  static async emit<T>(event: string, payload: T) {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    // Execute all handlers concurrently
    await Promise.allSettled(handlers.map(handler => handler(payload)));
  }

  static clear() {
    this.handlers.clear();
  }
}
