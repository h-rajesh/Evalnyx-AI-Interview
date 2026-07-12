interface Item {
  title: string;
  description: string;
  priority: string;
}

export default function LearningRoadmap({
  items,
}: {
  items: Item[];
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold">
        Learning Roadmap
      </h2>
      {items.map((item, index) => (
        <div
          key={index}
          className="border rounded-xl p-5"
        >
          <div className="flex justify-between">
            <h3 className="font-semibold">
              {item.title}
            </h3>
            <span>
              {item.priority}
            </span>
          </div>
          <p className="text-muted-foreground mt-2">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
