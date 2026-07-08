import { NextRequest, NextResponse } from "next/server";
import { MessageRole } from "@/app/generated/prisma/enums";
import { gemini } from "@/lib/ai/gemini";

import AIContextService from "@/services/ai-context.service";
import InterviewMessageService from "@/services/interview-message.service";
import PromptBuilderService from "@/services/prompt-builder.service";
import topicExtractorService from "@/services/topic-extractor.service";
import topicTrackerService from "@/services/topic-tracker.service";
import interviewService from "@/services/interview.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("========== AI CHAT ==========");
    console.log(body);

    const { interviewId, answer } = body;

    console.log("Interview ID:", interviewId);
    console.log("Answer:", answer);

    if (!interviewId) {
      return NextResponse.json(
        {
          success: false,
          message: "Interview ID is required.",
        },
        { status: 400 }
      );
    }

    // Save the user's answer if one exists
    if (answer?.trim()) {
      await InterviewMessageService.addMessage(
        interviewId,
        MessageRole.USER,
        answer
      );
    }

    // Fetch all interview context
    const context =
      await AIContextService.getInterviewContext(interviewId);

    // Build the Gemini prompt
    const prompt = PromptBuilderService.buildPrompt({
      user: context.user,
      interview: context.interview,
      resume: context.resume,
      messages: context.messages,
      latestAnswer: answer ?? "",
    });

    // Generate next interview question
    const response =
      await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

   const text = response.text ?? "";

let aiResponse;

try {
  aiResponse = JSON.parse(text);
} catch {
  aiResponse = {
    question: text,
    topic: "General",
    difficulty: "MEDIUM",
    followUp: false,
  };
}

      const topic = aiResponse.topic;

  const completedTopics =
  topicTrackerService.addTopic(
    context.interview.completedTopics,
    topic
  );

await interviewService.updateCompletedTopics(
  interviewId,
  completedTopics
);

await interviewService.incrementQuestion(
  interviewId
);

    // Save Gemini's question
   await InterviewMessageService.addMessage(
    interviewId,
    MessageRole.ASSISTANT,
    aiResponse.question
);

   return NextResponse.json({
    success: true,
    question: aiResponse.question,
    topic: aiResponse.topic,
    difficulty: aiResponse.difficulty,
    followUp: aiResponse.followUp,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate interview question.",
      },
      {
        status: 500,
      }
    );
  }
}