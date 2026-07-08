class TopicTrackerService {
  getCompletedTopics(
    completedTopics: unknown
  ): string[] {
    if (!completedTopics) {
      return [];
    }

    if (Array.isArray(completedTopics)) {
      return completedTopics as string[];
    }

    return [];
  }

  hasTopic(
    completedTopics: unknown,
    topic: string
  ) {
    const topics =
      this.getCompletedTopics(completedTopics);

    return topics.includes(topic);
  }

  addTopic(
    completedTopics: unknown,
    topic: string
  ) {
    const topics =
      this.getCompletedTopics(completedTopics);

    if (!topics.includes(topic)) {
      topics.push(topic);
    }

    return topics;
  }
}

export default new TopicTrackerService();