import InterviewEvaluationRepository from "@/repositories/interview-evaluation.repository";

class InterviewEvaluationService {
  async create(data: any) {
    return InterviewEvaluationRepository.create(data);
  }
}

export default new InterviewEvaluationService();