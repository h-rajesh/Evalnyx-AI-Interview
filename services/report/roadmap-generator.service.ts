import InterviewAIService from "@/services/interview-ai.service";

class RoadmapGenerator {

    async generate(data: any) {

        const prompt = `
You are an expert FAANG interviewer.

Based on this interview report generate JSON.

Return ONLY JSON.

{
 "careerAdvice":"",
 "nextInterviewDifficulty":"",

 "learningRoadmap":[
   {
      "title":"",
      "description":"",
      "priority":"HIGH|MEDIUM|LOW"
   }
 ],

 "suggestedAnswers":[
    {
       "question":"",
       "idealAnswer":""
    }
 ]
}

Interview:

${JSON.stringify(data)}
`;

        return InterviewAIService.process(prompt);

    }

}

export default new RoadmapGenerator();