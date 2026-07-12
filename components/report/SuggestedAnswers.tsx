interface Item {
  question: string;
  idealAnswer: string;
}

export default function SuggestedAnswers({
  answers,
}: {
  answers: Item[];
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Suggested Answers
      </h2>
      {answers.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl p-5"
        >
          <div className="font-semibold">
            {item.question}
          </div>
          <div className="mt-3 text-muted-foreground whitespace-pre-wrap">
            {item.idealAnswer}
          </div>
        </div>
      ))}
    </div>
  );
}
