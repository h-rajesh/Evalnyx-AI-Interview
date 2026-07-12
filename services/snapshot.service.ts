import realtimeAnalytics from "./analytics/realtime-analytics.service";

class SnapshotService {
  private timer: NodeJS.Timeout | null = null;

  start(interviewId: string) {
    if (this.timer) return;

    const startedAt = Date.now();

    this.timer = setInterval(async () => {
      try {
        const second = Math.floor(
          (Date.now() - startedAt) / 1000
        );

        const metrics = realtimeAnalytics.getSnapshot();

        await fetch("/api/interview/behavior", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interviewId,
            second,
            ...metrics,
          }),
        });
      } catch (err) {
        console.error(err);
      }
    }, 1000);
  }

  stop() {
    if (!this.timer) return;

    clearInterval(this.timer);

    this.timer = null;
  }
}

export default new SnapshotService();