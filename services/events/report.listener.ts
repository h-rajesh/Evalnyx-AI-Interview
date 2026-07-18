import eventBus from "./event-bus.service";
import { InterviewEvent } from "./event-types";
import analyticsEngine from "@/services/analytics/analytics-engine.service";
import reportGeneratorService from "@/services/report/report-generator.service";

eventBus.subscribe(
  InterviewEvent.INTERVIEW_COMPLETED,
  async (event) => {
    const interviewId = event.interviewId;
    
    // Generate analytics report
    await analyticsEngine.generateReport(interviewId);
    
    // Generate PDF/HTML/AI report summary
    await reportGeneratorService.generate(interviewId);

    // Publish REPORT_GENERATED event
    await eventBus.publish({
      id: `ev_rep_${interviewId}_${Date.now()}`,
      type: InterviewEvent.REPORT_GENERATED,
      interviewId,
      timestamp: new Date(),
      payload: {},
    });
  }
);
