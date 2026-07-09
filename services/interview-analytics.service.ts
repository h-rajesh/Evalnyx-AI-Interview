class InterviewAnalyticsService {
  calculate(interview: any) {
    return {
      technicalAverage: 0,
      communicationAverage: 0,
      confidenceAverage: 0,
      attentionAverage: 0,
      integrityAverage: 0,
      voiceAverage: 0,
      overallScore: 0
    };
  }
}

export default new InterviewAnalyticsService();