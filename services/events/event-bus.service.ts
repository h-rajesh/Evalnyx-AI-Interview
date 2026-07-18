import { InterviewEvent } from "./event-types";

export interface DomainEvent<T> {
  id: string;
  type: InterviewEvent;
  interviewId: string;
  timestamp: Date;
  payload: T;
}

type Handler<T = any> = (event: DomainEvent<T>) => Promise<void> | void;

class EventBus {
  private listeners = new Map<InterviewEvent, Handler[]>();

  subscribe<T>(type: InterviewEvent, handler: Handler<T>) {
    const handlers = this.listeners.get(type) ?? [];
    handlers.push(handler as Handler);
    this.listeners.set(type, handlers);
  }

  async publish<T>(event: DomainEvent<T>) {
    const handlers = this.listeners.get(event.type) ?? [];

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (err) {
          console.error(`Error in event handler for event type "${event.type}":`, err);
        }
      })
    );
  }
}

const eventBus = new EventBus();
export default eventBus;

// Register listeners dynamically when the EventBus is loaded
if (typeof window === "undefined") {
  (async () => {
    await import("./analytics.listener");
    await import("./report.listener");
    await import("./dashboard.listener");
  })().catch((err) => {
    console.error("Failed to load event listeners dynamically:", err);
  });
}
