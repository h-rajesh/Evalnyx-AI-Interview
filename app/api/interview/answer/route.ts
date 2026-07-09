import { NextRequest, NextResponse } from "next/server";
import { MessageRole } from "@/app/generated/prisma/enums";

import AIContextService from "@/services/ai-context.service";
import InterviewMessageService from "@/services/interview-message.service";
import PromptBuilderService from "@/services/prompt-builder.service";
import topicTrackerService from "@/services/topic-tracker.service";
import interviewService from "@/services/interview.service";
import interviewEvaluationService from "@/services/interview-evaluation.service";
import InterviewAIService from "@/services/interview-ai.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId, answer } = body;

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        { status: 400 }
      );
    }

    if (!answer?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Answer is required.",
        },
        { status: 400 }
      );
    }

    // Fetch context
    let context = await AIContextService.getInterviewContext(interviewId);

    // Save the user's answer
    await InterviewMessageService.addMessage(
      interviewId,
      MessageRole.USER,
      answer
    );

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

    const ai = await InterviewAIService.process(prompt);
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

    // Update Difficulty
    await interviewService.updateDifficulty(
      interviewId,
      evaluation.nextDifficulty
    );

    // Update Topics
    const completedTopics = topicTrackerService.addTopic(
      context.interview.completedTopics,
      nextQuestion.topic
    );

    await interviewService.updateCompletedTopics(
      interviewId,
      completedTopics
    );

    // Calculate if completed BEFORE incrementing question counter
    const completed = context.interview.currentQuestion >= context.interview.totalQuestions;

    // Increment Question Counter
    await interviewService.incrementQuestion(
      interviewId
    );

    // Save the Next AI Question
    await InterviewMessageService.addMessage(
      interviewId,
      MessageRole.ASSISTANT,
      nextQuestion.question
    );

    return NextResponse.json({
      success: true,
      question: nextQuestion.question,
      topic: nextQuestion.topic,
      difficulty: nextQuestion.difficulty,
      followUp: nextQuestion.followUp,
      evaluation,
      completed,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to evaluate answer and generate question.",
      },
      {
        status: 500,
      }
    );
  }
}
