"use client";

import { useEffect, useState } from "react";

export interface Resume {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  parsed: boolean;
  createdAt: string;
}

export function useResume() {
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchResume() {
    try {
      const res = await fetch("/api/resume");
      const json = await res.json();

      if (json.success) {
        setResume(json.data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchResume();
  }, []);

  return {
    resume,
    loading,
    refresh: fetchResume,
  };
}