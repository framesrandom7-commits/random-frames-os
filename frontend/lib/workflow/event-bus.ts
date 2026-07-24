import { Logger } from "@/lib/logger";
import { WorkflowEvent, WorkflowEventPayloads } from "./events";
import { auditLogEvent } from "../audit/audit-logger";

export type EventHandler<T extends WorkflowEvent> = (payload: WorkflowEventPayloads[T]) => Promise<void>;

interface RegisteredHandler<T extends WorkflowEvent> {
  name: string;
  handler: EventHandler<T>;
}

class EventBusService {
  private handlers: Map<WorkflowEvent, RegisteredHandler<any>[]> = new Map();
  private static instance: EventBusService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): EventBusService {
    if (!EventBusService.instance) {
      EventBusService.instance = new EventBusService();
    }
    return EventBusService.instance;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initialized = true;
      // Lazy load to prevent circular dependencies at boot
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { WorkflowEngine } = require('./workflow-engine');
      WorkflowEngine.initialize();
    }
  }

  /**
   * Subscribe a handler to a specific WorkflowEvent.
   */
  public subscribe<T extends WorkflowEvent>(event: T, handlerName: string, handler: EventHandler<T>) {
    const existing = this.handlers.get(event) || [];
    existing.push({ name: handlerName, handler });
    this.handlers.set(event, existing);
    Logger.info(`[EventBus] Subscribed handler '${handlerName}' to event '${event}'`);
  }

  /**
   * Publish an event. The payload is strongly typed based on the event.
   * This is non-blocking (fire and forget).
   */
  public publish<T extends WorkflowEvent>(event: T, payload: WorkflowEventPayloads[T]) {
    this.ensureInitialized();
    
    // 1. Immediately log to audit if there's a user
    const userId = (payload as any).userId;
    auditLogEvent(event, payload, userId).catch(err => Logger.error(`[EventBus] Audit log failed for ${event}`, err));

    // 2. Process handlers asynchronously
    this.processEvent(event, payload).catch(err => {
      Logger.error(`[EventBus] Unhandled error in processEvent for ${event}`, err);
    });
  }

  private async processEvent<T extends WorkflowEvent>(event: T, payload: WorkflowEventPayloads[T]) {
    const handlers = this.handlers.get(event) || [];
    Logger.info(`[EventBus] Emitted '${event}'. Executing ${handlers.length} handler(s).`);

    // Execute handlers concurrently and isolate errors
    const promises = handlers.map(async (registered) => {
      try {
        await registered.handler(payload);
        Logger.info(`[EventBus] Successfully executed '${registered.name}' for event '${event}'`);
      } catch (error: any) {
        // Log isolated error, do not fail the entire event bus
        Logger.error(`[EventBus] Handler '${registered.name}' failed for event '${event}': ${error.message}`, error);
      }
    });

    await Promise.allSettled(promises);
  }
}

export const EventBus = EventBusService.getInstance();
