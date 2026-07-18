import InterviewRepository from "@/repositories/interview.repository";
import ResumeRepository from "@/repositories/resume.repository";
import UserRepository from "@/repositories/user.repository";
import {
  InterviewStatus,
  interviewDifficulty,
  MessageRole,
} from "@/app/generated/prisma/enums";
import prisma from "@/lib/prisma";
import { InterviewUpdateInput } from "@/app/generated/prisma/models";

import AIContextService from "@/services/ai-context.service";
import InterviewMessageService from "@/services/interview-message.service";
import PromptBuilderService from "@/services/prompt-builder.service";
import topicTrackerService from "@/services/topic-tracker.service";
import InterviewAIService from "@/services/interview-ai.service";
import timelineService from "@/services/timeline/timeline.service";
import { TimelineEvents } from "@/constants/timeline-events";
import interviewEvaluationService from "@/services/interview-evaluation.service";
import behaviorScoreService from "@/services/behavior/behavior-score.service";

import interviewEngine from "./interview/interview-engine.service";
import interviewSessionManager from "./interview/interview-session-manager";
import interviewDifficultyService from "./interview/interview-difficulty.service";
import { InterviewState } from "./interview/interview-state.service";

class InterviewService {
  async createInterview(
    userId: string,
    data: {
      title: string;
      jobRole: string;
      company?: string | null;
      description?: string | null;
      difficulty: any;
      duration: number;
    }
  ) {
    const user =
      await UserRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.profileCompleted) {
      throw new Error(
        "Complete your profile first."
      );
    }

    const resume =
      await ResumeRepository.findByUserId(userId);

    if (!resume) {
      throw new Error(
        "Upload your resume first."
      );
    }

    return InterviewRepository.create({
      user: {
        connect: {
          id: userId,
        },
      },

      title: data.title,
      jobRole: data.jobRole,
      company: data.company,

      description: data.description,

      difficulty: data.difficulty,

      duration: data.duration,

      status: InterviewStatus.READY,
    });
  }

  async getInterviews(userId: string) {
    return InterviewRepository.findByUser(userId);
  }

  async getHistory() {
    return prisma.interview.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        report: true,
      },
    });
  }

  async getInterview(id: string) {
    const interview = await InterviewRepository.findById(id);
    if (!interview) {
      throw new Error("Interview not found");
    }
    return interview;
  }

  async updateInterview(id: string, data: InterviewUpdateInput) {
    return InterviewRepository.update(id, data);
  }

  async deleteInterview(id: string) {
    return InterviewRepository.delete(id);
  }

  async findByIdAndUser(
    id: string,
    userId: string
  ) {
    return prisma.interview.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async updateByIdAndUser(
    id: string,
    userId: string,
    data: InterviewUpdateInput
  ) {
    return prisma.interview.updateMany({
      where: {
        id,
        userId,
      },
      data,
    });
  }

  async deleteByIdAndUser(
    id: string,
    userId: string
  ) {
    return prisma.interview.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  async startInterview(id: string) {
    return InterviewRepository.update(id, {
      status: InterviewStatus.IN_PROGRESS,
    });
  }

  async updateCompletedTopics(
    id: string,
    topics: string[]
  ) {
    return InterviewRepository.updateCompletedTopics(
      id,
      topics
    );
  }

  async incrementQuestion(id: string) {
    return InterviewRepository.incrementQuestion(id);
  }

  async updateDifficulty(id: string, difficulty: interviewDifficulty) {
    return InterviewRepository.update(id, {
      difficulty,
    });
  }

  async startSession(interviewId: string) {
    await timelineService.create({
      interviewId,
      timestamp: 0,
      type: TimelineEvents.INTERVIEW_STARTED,
    });

    // Fetch all interview context
    const context = await AIContextService.getInterviewContext(interviewId);

    // Interview Starts: const session = sessionManager.create(context);
    const session = interviewSessionManager.create({
      interviewId,
      role: context.interview.jobRole,
      experience: context.user.experienceLevel || "Mid Level",
      difficulty: 1,
      currentQuestion: 1,
      totalQuestions: context.interview.totalQuestions || 10,
      startedAt: new Date(),
      state: InterviewState.INITIALIZING,
    });

    // Initialize interviewEngine
    interviewEngine.initialize(session);

    interviewEngine.setState(session, InterviewState.GENERATING_NEXT_QUESTION);

    // Build the Gemini prompt (empty latest question and answer on start)
    const prompt = PromptBuilderService.buildPrompt({
      user: context.user,
      interview: context.interview,
      resume: context.resume,
      messages: context.messages,
      latestQuestion: "",
      latestAnswer: "",
    });

    // Process prompt via InterviewAIService
    const ai = await InterviewAIService.process(prompt, context.messages);
    const nextQuestion = ai.nextQuestion;

    // Validate the topic/concept
    const isValid = interviewEngine.validate(session, nextQuestion.topic, nextQuestion.concept);
    if (!isValid) {
      console.warn(`Question topic "${nextQuestion.topic}" or concept "${nextQuestion.concept}" failed validation.`);
    }

    // Update Topics
    const completedTopics = topicTrackerService.addTopic(
      context.interview.completedTopics,
      nextQuestion.topic
    );

    await this.updateCompletedTopics(
      interviewId,
      completedTopics
    );

    // Increment Question Counter
    await this.incrementQuestion(
      interviewId
    );

    // Save the Next AI Question
    await InterviewMessageService.addMessage(
      interviewId,
      MessageRole.ASSISTANT,
      nextQuestion.question
    );

    // Remember the question
    interviewEngine.remember(session, {
      id: `q_${context.interview.currentQuestion + 1}`,
      question: nextQuestion.question,
      topic: nextQuestion.topic,
      concept: nextQuestion.concept || "",
      difficulty: nextQuestion.difficulty === "HARD" ? 3 : (nextQuestion.difficulty === "MEDIUM" ? 2 : 1),
    });

    interviewEngine.setState(session, InterviewState.ASKING_QUESTION);

    await timelineService.create({
      interviewId,
      timestamp: 1,
      type: TimelineEvents.AI_QUESTION,
      data: {
        question: nextQuestion.question,
        topic: nextQuestion.topic,
      },
    });

    // Transition engine state to WAITING_FOR_ANSWER as we return control to client
    interviewEngine.setState(session, InterviewState.WAITING_FOR_ANSWER);

    return {
      success: true,
      question: nextQuestion.question,
      topic: nextQuestion.topic,
      difficulty: nextQuestion.difficulty,
      followUp: nextQuestion.followUp,
    };
  }

  async submitAnswer(interviewId: string, answer: string) {
    // Every API Call: const session = sessionManager.get(interviewId);
    let session = interviewSessionManager.get(interviewId);

    if (!session) {
      const context = await AIContextService.getInterviewContext(interviewId);
      session = interviewSessionManager.create({
        interviewId,
        role: context.interview.jobRole,
        experience: context.user.experienceLevel || "Mid Level",
        difficulty: context.interview.difficulty === "HARD" ? 3 : (context.interview.difficulty === "MEDIUM" ? 2 : 1),
        currentQuestion: context.interview.currentQuestion,
        totalQuestions: context.interview.totalQuestions || 10,
        startedAt: context.interview.createdAt,
        state: InterviewState.WAITING_FOR_ANSWER,
      });
      interviewEngine.initialize(session);
    } else {
      session.touch();
    }

    interviewEngine.setState(session, InterviewState.EVALUATING_ANSWER);

    // Fetch context
    let context = await AIContextService.getInterviewContext(interviewId);

    // Save the user's answer
    await InterviewMessageService.addMessage(
      interviewId,
      MessageRole.USER,
      answer
    );

    await timelineService.create({
      interviewId,
      timestamp: Math.floor(Date.now() / 1000),
      type: TimelineEvents.USER_SUBMITTED_ANSWER,
    });

    // Reload context to include updated messages
    context = await AIContextService.getInterviewContext(interviewId);

    const lastAssistant = [...context.messages]
      .reverse()
      .find((m) => m.role === MessageRole.ASSISTANT);

    const latestQuestion = lastAssistant?.content ?? "";

    // Build prompt and process evaluation and next question
    const prompt = PromptBuilderService.buildPrompt({
      user: context.user,
      interview: context.interview,
      resume: context.resume,
      messages: context.messages,
      latestQuestion,
      latestAnswer: answer,
    });

    const ai = await InterviewAIService.process(prompt, context.messages);
    const evaluation = ai.evaluation;
    const nextQuestion = ai.nextQuestion;

    // Save Evaluation
    await interviewEvaluationService.create({
      interview: {
        connect: {
          id: interviewId,
        },
      },
      questionNumber: context.interview.currentQuestion,
      question: latestQuestion,
      answer,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      confidenceScore: evaluation.confidenceScore,
      correctnessScore: evaluation.correctnessScore,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      feedback: evaluation.feedback,
    });

    // After AI evaluation is available, update local behavior score service on the server
    behaviorScoreService.updateEvaluation(
      evaluation.correctnessScore,
      evaluation.communicationScore
    );

    await timelineService.create({
      interviewId,
      timestamp: Math.floor(Date.now() / 1000),
      type: TimelineEvents.AI_EVALUATED,
      data: {
        technical: evaluation.technicalScore,
        communication: evaluation.communicationScore,
        confidence: evaluation.confidenceScore,
      },
    });

    // Add evaluation history to difficulty tracker
    interviewDifficultyService.addEvaluation(session, {
      technical: evaluation.technicalScore,
      communication: evaluation.communicationScore,
      confidence: evaluation.confidenceScore,
    });

    // Get updated difficulty from engine
    const nextDifficultyString = interviewEngine.difficulty(session); // "EASY" | "MEDIUM" | "HARD"
    const prismaDifficulty = nextDifficultyString as interviewDifficulty;

    // Update Difficulty in Database
    await this.updateDifficulty(
      interviewId,
      prismaDifficulty
    );

    // Update Topics
    const completedTopics = topicTrackerService.addTopic(
      context.interview.completedTopics,
      nextQuestion.topic
    );

    await this.updateCompletedTopics(
      interviewId,
      completedTopics
    );

    // Decide follow up using engine
    const followupDecision = interviewEngine.shouldFollowup(
      session,
      evaluation.technicalScore,
      evaluation.communicationScore,
      evaluation.confidenceScore
    );

    // Calculate if completed BEFORE incrementing question counter
    const completed = context.interview.currentQuestion >= context.interview.totalQuestions;

    let updatedCurrentQuestion = context.interview.currentQuestion;

    interviewEngine.setState(session, InterviewState.GENERATING_NEXT_QUESTION);

    if (!completed) {
      // Save the Next AI Question
      await InterviewMessageService.addMessage(
        interviewId,
        MessageRole.ASSISTANT,
        nextQuestion.question
      );

      await timelineService.create({
        interviewId,
        timestamp: Math.floor(Date.now() / 1000),
        type: TimelineEvents.AI_QUESTION,
        data: {
          question: nextQuestion.question,
          topic: nextQuestion.topic,
        },
      });

      // Increment Question Counter
      const updatedInterview = await this.incrementQuestion(
        interviewId
      );
      updatedCurrentQuestion = updatedInterview.currentQuestion;

      // Validate topic/concept
      const isValid = interviewEngine.validate(session, nextQuestion.topic, nextQuestion.concept);
      if (!isValid) {
        console.warn(`Question topic "${nextQuestion.topic}" or concept "${nextQuestion.concept}" failed validation.`);
      }

      // Remember next question
      interviewEngine.remember(session, {
        id: `q_${updatedCurrentQuestion}`,
        question: nextQuestion.question,
        topic: nextQuestion.topic,
        concept: nextQuestion.concept || "",
        difficulty: nextQuestion.difficulty === "HARD" ? 3 : (nextQuestion.difficulty === "MEDIUM" ? 2 : 1),
      });

      interviewEngine.setState(session, InterviewState.ASKING_QUESTION);
      interviewEngine.setState(session, InterviewState.WAITING_FOR_ANSWER);
    } else {
      // Save the closing message
      await InterviewMessageService.addMessage(
        interviewId,
        MessageRole.ASSISTANT,
        nextQuestion.question
      );

      interviewEngine.setState(session, InterviewState.COMPLETED);

      // Interview Ends
      interviewSessionManager.remove(interviewId);
    }

    return {
      success: true,
      question: nextQuestion.question,
      topic: nextQuestion.topic,
      difficulty: nextQuestion.difficulty,
      followUp: followupDecision.followUp, // Use engine follow-up decision
      evaluation,
      completed,
      currentQuestion: updatedCurrentQuestion,
      totalQuestions: context.interview.totalQuestions,
    };
  }
}

export default new InterviewService();