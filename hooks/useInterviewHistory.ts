import { useQuery } from "@tanstack/react-query";

export function useInterviewHistory() {
  return useQuery({
    queryKey: ["interview-history"],

    queryFn: async () => {
      const res = await fetch("/api/interviews/history");

      if (!res.ok)
        throw new Error("Failed");

      return res.json();
    },
  });
}