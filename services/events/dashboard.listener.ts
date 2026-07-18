import eventBus from "./event-bus.service";
import { InterviewEvent } from "./event-types";
import dashboardService from "@/services/dashboard.service";

eventBus.subscribe(
  InterviewEvent.REPORT_GENERATED,
  async (event) => {
    await dashboardService.update();
  }
);
