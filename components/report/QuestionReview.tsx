interface Evaluation {
  id: string;

  questionNumber: number;

  question: string;

  answer: string;

  technicalScore: number;

  communicationScore: number;

  confidenceScore: number;

  correctnessScore: number;

  feedback: string;

  strengths: string[];

  weaknesses: string[];
}

interface Props {
  evaluations: Evaluation[];
}

export default function QuestionReview({
  evaluations,
}: Props) {
  return (
    <div className="space-y-6">

      <h2 className="text-2xl font-bold">
        Question Review
      </h2>

      {evaluations.map((evaluation) => (
        <div
          key={evaluation.id}
          className="rounded-xl border p-6 space-y-5"
        >
          <div>

            <div className="text-xs text-muted-foreground">
              Question {evaluation.questionNumber}
            </div>

            <h3 className="font-semibold text-lg mt-1">
              {evaluation.question}
            </h3>

          </div>

          <div>

            <div className="font-medium mb-2">
              Your Answer
            </div>

            <p className="text-muted-foreground whitespace-pre-wrap">
              {evaluation.answer}
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <ScoreCard
              title="Technical"
              value={evaluation.technicalScore}
            />

            <ScoreCard
              title="Communication"
              value={evaluation.communicationScore}
            />

            <ScoreCard
              title="Confidence"
              value={evaluation.confidenceScore}
            />

            <ScoreCard
              title="Correctness"
              value={evaluation.correctnessScore}
            />

          </div>

          <div>

            <div className="font-medium mb-2">
              AI Feedback
            </div>

            <p className="text-muted-foreground">
              {evaluation.feedback}
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <div className="font-semibold text-green-600 mb-2">
                Strengths
              </div>

              <ul className="space-y-2">

                {evaluation.strengths.map(
                  (item, index) => (
                    <li key={index}>
                      • {item}
                    </li>
                  )
                )}

              </ul>

            </div>

            <div>

              <div className="font-semibold text-yellow-600 mb-2">
                Improvements
              </div>

              <ul className="space-y-2">

                {evaluation.weaknesses.map(
                  (item, index) => (
                    <li key={index}>
                      • {item}
                    </li>
                  )
                )}

              </ul>

            </div>

          </div>

        </div>
      ))}
    </div>
  );
}

function ScoreCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border p-4">

      <div className="text-sm text-muted-foreground">
        {title}
      </div>

      <div className="text-3xl font-bold mt-2">
        {value}
      </div>

    </div>
  );
}