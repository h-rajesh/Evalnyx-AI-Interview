import { MessageRole } from "@/app/generated/prisma/enums";
import InterviewMessageRepository from "@/repositories/interview-message.repository";

class InterviewMessageService {
  async addMessage(
    interviewId: string,
    role: MessageRole,
    content: string
  ) {
    return InterviewMessageRepository.create({
      interviewId,
      role,
      content,
    });
  }

  async getConversation(interviewId: string) {
    return InterviewMessageRepository.findByInterviewId(interviewId);
  }

  async clearConversation(interviewId: string) {
    return InterviewMessageRepository.deleteByInterviewId(interviewId);
  }
}

export default new InterviewMessageService();