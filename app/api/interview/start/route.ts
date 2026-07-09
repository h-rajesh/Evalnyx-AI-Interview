import { NextRequest, NextResponse } from "next/server";
import { MessageRole } from "@/app/generated/prisma/enums";

import AIContextService from "@/services/ai-context.service";
import InterviewMessageService from "@/services/interview-message.service";
import PromptBuilderService from "@/services/prompt-builder.service";
import topicTrackerService from "@/services/topic-tracker.service";
import interviewService from "@/services/interview.service";
import InterviewAIService from "@/services/interview-ai.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        { status: 400 }
      );
    }

    // Fetch all interview context
    const context = await AIContextService.getInterviewContext(interviewId);

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
    const ai = await InterviewAIService.process(prompt);
    const nextQuestion = ai.nextQuestion;

    // Update Topics
    const completedTopics = topicTrackerService.addTopic(
      context.interview.completedTopics,
      nextQuestion.topic
    );

    await interviewService.updateCompletedTopics(
      interviewId,
      completedTopics
    );

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
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate start interview question.",
      },
      {
        status: 500,
      }
    );
  }
}
