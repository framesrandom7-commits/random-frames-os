import { RealtimeProtocol, RealtimeBroadcastMessage } from "./types";
import { Logger } from "@/lib/logger";

/**
 * Realtime Broadcast Adapter
 * Prepares Random Frames OS for real-time live synchronization (WebSockets, Server-Sent Events, Realtime subscriptions).
 * Connects domain events to scalable streaming channels without modifying domain business logic or current refresh-based UI views.
 */
export class RealtimeBroadcastAdapter {
  private static eventStreamHistory: RealtimeBroadcastMessage[] = [];
  private static activeSubscribers: Map<string, ((message: RealtimeBroadcastMessage) => void)[]> = new Map();

  /**
   * Broadcasts a real-time state change across enterprise collaboration channels.
   */
  public static broadcast(
    topic: string,
    event: string,
    payload: Record<string, any>,
    protocol: RealtimeProtocol = RealtimeProtocol.WEBSOCKET
  ): RealtimeBroadcastMessage {
    const message: RealtimeBroadcastMessage = {
      protocol,
      topic,
      event,
      payload,
      timestamp: new Date(),
    };

    this.eventStreamHistory.push(message);
    if (this.eventStreamHistory.length > 500) {
      this.eventStreamHistory.shift(); // keep stream bounded
    }

    // Deliver to registered streaming subscribers if any exist
    const callbacks = this.activeSubscribers.get(topic) || [];
    callbacks.forEach((cb) => cb(message));

    Logger.info(`[RealtimeAdapter] Broadcasted (${protocol}) over topic '${topic}': event '${event}'`);
    return message;
  }

  /**
   * Subscribes an active listener or SSE stream connection to a topic.
   */
  public static subscribeToTopic(topic: string, callback: (message: RealtimeBroadcastMessage) => void): void {
    const list = this.activeSubscribers.get(topic) || [];
    list.push(callback);
    this.activeSubscribers.set(topic, list);
    Logger.info(`[RealtimeAdapter] New streaming subscriber attached to topic '${topic}'`);
  }

  /**
   * Retrieves broadcast history for testing and state verification.
   */
  public static getBroadcastHistory(topic?: string): RealtimeBroadcastMessage[] {
    if (topic) {
      return this.eventStreamHistory.filter((m) => m.topic === topic);
    }
    return [...this.eventStreamHistory];
  }

  /**
   * Clears streams for testing resets.
   */
  public static resetAdapter(): void {
    this.eventStreamHistory = [];
    this.activeSubscribers.clear();
  }
}
